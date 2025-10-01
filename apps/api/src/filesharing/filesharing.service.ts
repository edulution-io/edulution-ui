/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { Request, Response } from 'express';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import { WebdavStatusResponse } from '@libs/filesharing/types/fileOperationResult';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import { LmnApiCollectOperationsType } from '@libs/lmnApi/types/lmnApiCollectOperationsType';
import JOB_NAMES from '@libs/queue/constants/jobNames';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import { createWriteStream } from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ContentType from '@libs/filesharing/types/contentType';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import FILE_ACCESS_RESULT from '@libs/filesharing/constants/fileAccessResult';
import checkFileAccessRights from '@libs/filesharing/utils/checkFileAccessRights';
import CreateOrEditPublicShareDto from '@libs/filesharing/types/createOrEditPublicShareDto';
import PublicShareDto from '@libs/filesharing/types/publicShareDto';
import { v4 as uuidv4 } from 'uuid';
import PublicShareResponseDto from '@libs/filesharing/types/publicShareResponseDto';
import PUBLIC_SHARE_LINK_SCOPE from '@libs/filesharing/constants/publicShareLinkScope';
import CustomFile from '@libs/filesharing/types/customFile';
import { lookup } from 'mime-types';
import unzipper, { Entry } from 'unzipper';
import { join } from 'path';
import { tmpdir } from 'os';
import { pipeline } from 'stream/promises';
import { PublicShare, PublicShareDocument } from './publicFileShare.schema';
import UsersService from '../users/users.service';
import WebdavService from '../webdav/webdav.service';
import OnlyofficeService from './onlyoffice.service';
import FilesystemService from '../filesystem/filesystem.service';
import QueueService from '../queue/queue.service';
import CustomHttpException from '../common/CustomHttpException';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';

@Injectable()
class FilesharingService {
  constructor(
    @InjectModel(PublicShare.name)
    private readonly shareModel: Model<PublicShareDocument>,
    private readonly onlyofficeService: OnlyofficeService,
    private readonly fileSystemService: FilesystemService,
    private readonly dynamicQueueService: QueueService,
    private readonly webDavService: WebdavService,
    private readonly userService: UsersService,
    private readonly webdavSharesService: WebdavSharesService,
  ) {}

  async uploadZippedFolderStream(
    username: string,
    parentPath: string,
    folderName: string,
    zipStream: Readable,
    share: string,
  ): Promise<WebdavStatusResponse> {
    const destinationFolderPath = `${parentPath}/${folderName}`;
    await this.webDavService.ensureFolderExists(username, parentPath, folderName, share);

    const zipEntryStream = zipStream.pipe(unzipper.Parse());
    const directoryPaths = new Set<string>();
    const fileJobPromises: Promise<void>[] = [];

    await new Promise<void>((resolve, reject) => {
      zipEntryStream
        .on('entry', (zipEntry: Entry) => {
          if (zipEntry.type === 'Directory') {
            directoryPaths.add(zipEntry.path);
            zipEntry.autodrain();
            return;
          }
          zipEntry.path
            .split('/')
            .slice(0, -1)
            .reduce((accumulatedPath, pathSegment) => {
              const nextDirectoryPath = `${accumulatedPath}${pathSegment}/`;
              directoryPaths.add(nextDirectoryPath);
              return nextDirectoryPath;
            }, '');

          const fullWebDavFilePath = `${destinationFolderPath}/${zipEntry.path}`;
          const detectedMimeType = lookup(zipEntry.path) || RequestResponseContentType.APPLICATION_OCTET_STREAM;
          const tmpPath = join(tmpdir(), crypto.randomUUID());
          const writePromise = pipeline(zipEntry, createWriteStream(tmpPath));
          fileJobPromises.push(
            writePromise.then(() =>
              this.dynamicQueueService.addJobForUser(username, JOB_NAMES.FILE_UPLOAD_JOB, {
                username,
                fullPath: fullWebDavFilePath,
                tempPath: tmpPath,
                mimeType: detectedMimeType,
                total: 0,
                processed: 0,
                share,
              }),
            ),
          );
        })
        .once('error', (err) => reject(err))
        .once('close', () => resolve());
    });
    const sortedDirs = Array.from(directoryPaths).sort((a, b) => a.length - b.length);
    await Promise.all(
      sortedDirs.map((folderPath, idx) =>
        this.dynamicQueueService.addJobForUser(username, JOB_NAMES.CREATE_FOLDER_JOB, {
          username,
          basePath: destinationFolderPath,
          folderPath,
          total: sortedDirs.length,
          processed: idx + 1,
          share,
        }),
      ),
    );
    await Promise.all(fileJobPromises);
    return { success: true, status: HttpStatus.CREATED, filename: folderName };
  }

  private static resolveFileSize(req: Request, fileSize: number): number | undefined {
    const incomingLen = Number(req.headers[HTTP_HEADERS.ContentLength] || 0);
    if (Number.isFinite(incomingLen) && incomingLen > 0) return incomingLen;
    if (Number.isFinite(fileSize) && fileSize > 0) return fileSize;
    return undefined;
  }

  async uploadFileViaWebDav(
    username: string,
    path: string,
    name: string,
    req: Request,
    share: string,
    isZippedFolder = false,
    fileSize = 0,
  ) {
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);
    const basePath = getPathWithoutWebdav(path, webdavShare.pathname);
    const fullPath = `${basePath.replace(/\/+$/, '')}/${name.replace(/^\/+/, '')}`;

    if (isZippedFolder) {
      return this.uploadZippedFolderStream(username, basePath, name, req, share);
    }

    const contentType =
      (req.headers[HTTP_HEADERS.ContentType] as string) || RequestResponseContentType.APPLICATION_OCTET_STREAM;

    const totalSize = FilesharingService.resolveFileSize(req, fileSize);

    return this.webDavService.uploadFile(username, fullPath, req, share, contentType, totalSize);
  }

  async duplicateFile(username: string, duplicateFile: DuplicateFileRequestDto, share: string) {
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);

    let i = 0;
    return Promise.all(
      duplicateFile.destinationFilePaths.map(async (destinationPath) => {
        await this.dynamicQueueService.addJobForUser(username, JOB_NAMES.DUPLICATE_FILE_JOB, {
          username,
          originFilePath: getPathWithoutWebdav(duplicateFile.originFilePath, webdavShare.pathname),
          destinationFilePath: destinationPath,
          total: duplicateFile.destinationFilePaths.length,
          processed: (i += 1),
          share,
        });
      }),
    );
  }

  async copyFileOrFolder(username: string, copyFileRequestDTOs: PathChangeOrCreateProps[], share: string) {
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);

    let processedItems = 0;
    return Promise.all(
      copyFileRequestDTOs.map(async (copyFileRequest) => {
        const { path, newPath } = copyFileRequest;
        const trimmedNewPath = getPathWithoutWebdav(newPath.trim(), webdavShare.pathname);

        await this.dynamicQueueService.addJobForUser(username, JOB_NAMES.COPY_FILE_JOB, {
          username,
          originFilePath: getPathWithoutWebdav(path, webdavShare.pathname),
          destinationFilePath: trimmedNewPath,
          total: copyFileRequestDTOs.length,
          processed: (processedItems += 1),
          share,
        });
      }),
    );
  }

  async collectFiles(
    username: string,
    collectFileRequestDTOs: CollectFileRequestDTO[],
    userRole: string,
    type: LmnApiCollectOperationsType,
    share: string,
  ) {
    let processedItems = 0;
    return Promise.all(
      collectFileRequestDTOs.map(async (collectFileRequest) => {
        await this.dynamicQueueService.addJobForUser(username, JOB_NAMES.COLLECT_FILE_JOB, {
          username,
          userRole,
          item: collectFileRequest,
          operationType: type,
          total: collectFileRequestDTOs.length,
          processed: (processedItems += 1),
          share,
        });
      }),
    );
  }

  async moveOrRenameResources(username: string, pathChangeOrCreateDtos: PathChangeOrCreateProps[], share: string) {
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);

    let processedItems = 0;
    return Promise.all(
      pathChangeOrCreateDtos.map(async (pathChange) => {
        const { path, newPath } = pathChange;
        const trimmedNewPath = getPathWithoutWebdav(newPath.trim(), webdavShare.pathname);

        await this.dynamicQueueService.addJobForUser(username, JOB_NAMES.MOVE_OR_RENAME_JOB, {
          username,
          path: getPathWithoutWebdav(path, webdavShare.pathname),
          newPath: trimmedNewPath,
          total: pathChangeOrCreateDtos.length,
          processed: (processedItems += 1),
          share,
        });
      }),
    );
  }

  async deleteFileAtPath(username: string, paths: string[], share: string) {
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);
    let processedItems = 0;
    return Promise.all(
      paths.map(async (path) => {
        const pathWithoutWebdav = getPathWithoutWebdav(path, webdavShare.pathname);

        const fullPath = `${webdavShare.url.replace(/\/+$/, '')}/${pathWithoutWebdav.replace(/^\/+/, '')}`;
        await this.dynamicQueueService.addJobForUser(username, JOB_NAMES.DELETE_FILE_JOB, {
          username,
          originFilePath: fullPath,
          webdavFilePath: pathWithoutWebdav,
          total: paths.length,
          processed: (processedItems += 1),
          share,
        });
      }),
    );
  }

  async getWebDavFileStream(username: string, filePath: string, share: string): Promise<Readable> {
    try {
      const client = await this.webDavService.getClient(username, share);
      const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);
      const pathWithoutWebdav = getPathWithoutWebdav(filePath, webdavShare.pathname);
      const url = WebdavService.safeJoinUrl(webdavShare.url, pathWithoutWebdav);

      const resp = await FilesystemService.fetchFileStream(url, client);
      return resp instanceof Readable ? resp : resp.data;
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.DownloadFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `${username} ${filePath}`,
      );
    }
  }

  async fileLocation(
    username: string,
    filePath: string,
    filename: string,
    share: string,
  ): Promise<WebdavStatusResponse> {
    const client = await this.webDavService.getClient(username, share);
    return this.fileSystemService.fileLocation(username, filePath, filename, client, share);
  }

  async getOnlyOfficeToken(payload: string) {
    return this.onlyofficeService.generateOnlyOfficeToken(payload);
  }

  async handleCallback(req: Request, res: Response, path: string, filename: string, username: string, share: string) {
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);

    return OnlyofficeService.handleCallback(
      req,
      res,
      getPathWithoutWebdav(path, webdavShare.pathname),
      filename,
      username,
      async (user: string, uploadPath: string, file: CustomFile, name: string): Promise<WebdavStatusResponse> => {
        const readableStream = Readable.from(file.buffer);
        return this.webDavService.uploadFile(
          user,
          `${webdavShare.url}${uploadPath}/${name}`,
          readableStream,
          file.mimetype,
          share,
        );
      },
    );
  }

  async createPublicShare(
    currentUser: JwtUser,
    createPublicShareDto: CreateOrEditPublicShareDto,
  ): Promise<PublicShareResponseDto> {
    const { etag, share, filename, filePath, invitedAttendees, invitedGroups, password, expires, scope } =
      createPublicShareDto;

    try {
      const user = await this.userService.findOne(currentUser.preferred_username);
      if (!user) {
        return { success: false, status: HttpStatus.INTERNAL_SERVER_ERROR };
      }

      const publicShareId = uuidv4();
      const newShare = await this.shareModel.create({
        publicShareId,
        etag,
        share,
        filename,
        filePath,
        creator: {
          firstName: currentUser.given_name ?? '',
          lastName: currentUser.family_name ?? '',
          username: currentUser.preferred_username,
        },
        invitedAttendees,
        invitedGroups,
        password,
        expires,
      });

      const publicShare: PublicShareDto = {
        ...(newShare as Omit<PublicShareDto, 'scope'>),
        scope,
      };

      return {
        success: true,
        status: HttpStatus.OK,
        publicShare,
      };
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.SharingFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async listOwnPublicShares(username: string): Promise<PublicShareResponseDto> {
    const publicShares = await this.shareModel
      .find({ 'creator.username': username })
      .sort({ validUntil: 1 })
      .lean()
      .exec();

    const publicShare: PublicShareDto[] = publicShares.map((share) => {
      const scope =
        (share.invitedAttendees?.length ?? 0) > 0 || (share.invitedGroups?.length ?? 0) > 0
          ? PUBLIC_SHARE_LINK_SCOPE.RESTRICTED
          : PUBLIC_SHARE_LINK_SCOPE.PUBLIC;

      return {
        ...(share as Omit<PublicShareDto, 'scope'>),
        scope,
      };
    });

    return {
      success: true,
      status: HttpStatus.OK,
      publicShare,
    };
  }

  async getPublicShare(
    publicShareId: string,
    jwtUser: JwtUser | undefined,
    share: string,
    password?: string | undefined,
  ) {
    const publicShare = await this.shareModel.findOne({ publicShareId }).lean().exec();
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);

    if (!publicShare) {
      throw new CustomHttpException(
        FileSharingErrorMessage.DownloadFailed,
        HttpStatus.NOT_FOUND,
        `${publicShareId} not found`,
      );
    }
    if (publicShare.password && publicShare.password !== password) {
      throw new CustomHttpException(
        FileSharingErrorMessage.PublicFileWrongPassword,
        HttpStatus.FORBIDDEN,
        `${publicShareId} wrong password`,
      );
    }

    const { invitedAttendees, invitedGroups } = publicShare;

    const access = checkFileAccessRights(invitedAttendees, invitedGroups, jwtUser);

    if (access === FILE_ACCESS_RESULT.DENIED || access === FILE_ACCESS_RESULT.NO_TOKEN) {
      throw new CustomHttpException(
        FileSharingErrorMessage.PublicFileIsRestricted,
        HttpStatus.FORBIDDEN,
        `${publicShareId} not found`,
      );
    }

    const pathWithoutWebdav = getPathWithoutWebdav(publicShare.filePath, webdavShare.pathname);
    const webDavUrl = new URL(encodeURI(pathWithoutWebdav), webdavShare.url).href;
    const client = await this.webDavService.getClient(publicShare.creator.username, share);

    const stream = (await FilesystemService.fetchFileStream(webDavUrl, client, false)) as Readable;

    const fileType = await this.webDavService.getFileTypeFromWebdavPath(
      publicShare.creator.username,
      pathWithoutWebdav,
      publicShare.filePath,
      share,
    );

    const filename = fileType === ContentType.FILE ? publicShare.filename : `${publicShare.filename}.zip`;

    return { stream, filename, fileType };
  }

  async getPublicShareInfo(publicShareId: string, jwtUser: JwtUser | undefined): Promise<PublicShareResponseDto> {
    const shareDocument = await this.shareModel
      .findOne({ publicShareId })
      .lean<PublicShareDto>({ virtuals: true })
      .exec();

    if (!shareDocument) {
      return { status: HttpStatus.NOT_FOUND, success: false };
    }

    const requiresPassword = !!shareDocument.password?.trim();

    const { invitedAttendees, invitedGroups, createdAt, ...publicShareBase } = shareDocument;

    const scope =
      invitedAttendees.length > 0 || invitedGroups.length > 0
        ? PUBLIC_SHARE_LINK_SCOPE.RESTRICTED
        : PUBLIC_SHARE_LINK_SCOPE.PUBLIC;

    switch (checkFileAccessRights(invitedAttendees, invitedGroups, jwtUser)) {
      case FILE_ACCESS_RESULT.PUBLIC:
      case FILE_ACCESS_RESULT.USER_MATCH:
      case FILE_ACCESS_RESULT.GROUP_MATCH:
        return {
          success: true,
          status: HttpStatus.OK,
          requiresPassword,
          isAccessRestricted: false,
          publicShare: {
            ...publicShareBase,
            invitedAttendees,
            invitedGroups,
            publicShareId,
            password: '',
            scope,
            createdAt,
          },
        };

      case FILE_ACCESS_RESULT.NO_TOKEN:
      case FILE_ACCESS_RESULT.DENIED:
      default:
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          isAccessRestricted: true,
        };
    }
  }

  async deletePublicShares(username: string, publicFiles: PublicShareDto[]): Promise<PublicShareResponseDto> {
    const publicShareIds = publicFiles.map((file) => file.publicShareId);

    const documentsToDelete = await this.shareModel
      .find({ publicShareId: { $in: publicShareIds }, 'creator.username': username })
      .lean()
      .exec();

    if (documentsToDelete.length !== publicShareIds.length) {
      throw new CustomHttpException(
        FileSharingErrorMessage.PublicFileNotFound,
        HttpStatus.NOT_FOUND,
        `${username} ${publicShareIds.join(', ')}`,
      );
    }

    const foreignShare = documentsToDelete.find((d) => d.creator.username !== username);
    if (foreignShare) {
      throw new CustomHttpException(
        FileSharingErrorMessage.PublicFileIsOnlyDeletableByOwner,
        HttpStatus.FORBIDDEN,
        `${username} ${publicShareIds.join(', ')}`,
      );
    }

    const { deletedCount } = await this.shareModel
      .deleteMany({ publicShareId: { $in: publicShareIds }, 'creator.username': username })
      .exec();

    return { success: true, deletedCount, status: HttpStatus.OK };
  }

  async editPublicShare(username: string, dto: PublicShareDto): Promise<PublicShareResponseDto> {
    const { publicShareId, expires, invitedGroups, invitedAttendees, password, scope } = dto;

    const updates: Record<string, unknown> = {};
    if (expires) updates.expires = expires;
    if (invitedAttendees) updates.invitedAttendees = invitedAttendees;
    if (invitedGroups) updates.invitedGroups = invitedGroups;
    if (password !== undefined) updates.password = password;

    const share = await this.shareModel
      .findOneAndUpdate({ publicShareId, 'creator.username': username }, { $set: updates }, { new: true })
      .lean<PublicShare & { createdAt: Date }>()
      .exec();

    if (!share) {
      throw new CustomHttpException(
        FileSharingErrorMessage.PublicFileNotFound,
        HttpStatus.NOT_FOUND,
        `${username} ${publicShareId}`,
      );
    }

    const publicShare: PublicShareDto = {
      ...(share as Omit<PublicShareDto, 'scope'>),
      scope,
    };

    return { success: true, status: HttpStatus.OK, publicShare };
  }
}

export default FilesharingService;
