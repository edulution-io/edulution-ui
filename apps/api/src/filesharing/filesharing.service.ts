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
import archiver from 'archiver';
import { once } from 'events';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import { createReadStream, createWriteStream, statSync } from 'fs';
import createTempFile from '@libs/filesystem/utils/createTempFile';
import CustomFile from '@libs/filesharing/types/customFile';
import { Open } from 'unzipper';
import { lookup } from 'mime-types';
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
import { PublicShare, PublicShareDocument } from './publicFileShare.schema';
import UsersService from '../users/users.service';
import WebdavService from '../webdav/webdav.service';
import OnlyofficeService from './onlyoffice.service';
import FilesystemService from '../filesystem/filesystem.service';
import QueueService from '../queue/queue.service';
import CustomHttpException from '../common/CustomHttpException';

@Injectable()
class FilesharingService {
  private readonly baseurl = process.env.EDUI_WEBDAV_URL as string;

  constructor(
    @InjectModel(PublicShare.name)
    private readonly shareModel: Model<PublicShareDocument>,
    private readonly onlyofficeService: OnlyofficeService,
    private readonly fileSystemService: FilesystemService,
    private readonly dynamicQueueService: QueueService,
    private readonly webDavService: WebdavService,
    private readonly userService: UsersService,
  ) {}

  async uploadZippedFolder(
    username: string,
    parentPath: string,
    folderName: string,
    zipFile: CustomFile,
  ): Promise<WebdavStatusResponse> {
    await this.webDavService.ensureFolderExists(username, `${parentPath}/`, folderName);

    const directory = await Open.buffer(zipFile.buffer);
    const explicitDirs = directory.files.filter((f) => f.type === 'Directory');
    const fileEntries = directory.files.filter((f) => f.type === 'File');
    const totalFiles = fileEntries.length;
    const dirSet = new Set<string>();

    explicitDirs.forEach((d) => dirSet.add(d.path));
    fileEntries.forEach(({ path }) => {
      const segments = path.split('/').filter(Boolean);
      segments.pop();

      let cumulativePath = '';

      segments.forEach((segment) => {
        cumulativePath += `${segment}/`;
        dirSet.add(cumulativePath);
      });
    });

    const allDirs = Array.from(dirSet).sort((a, b) => a.length - b.length);

    const totalDirs = allDirs.length;

    let processedZipContent = 0;

    await allDirs.reduce<Promise<void>>(async (prev, dirPath) => {
      await prev;
      await this.dynamicQueueService.addJobForUser(username, JOB_NAMES.CREATE_FOLDER_JOB, {
        username,
        basePath: `${parentPath}/${folderName}`,
        folderPath: dirPath,
        total: totalDirs,
        processed: (processedZipContent += 1),
      });
    }, Promise.resolve());

    processedZipContent = 0;

    await Promise.all(
      fileEntries.map(async (entry) => {
        if (entry.path.startsWith('__MACOSX') || entry.path.endsWith('.DS_Store')) return;

        const buffer = Buffer.from(await entry.buffer());
        const base64 = buffer.toString('base64');
        const fileName = entry.path.split('/').pop()!;
        const mimeType = lookup(fileName);

        await this.dynamicQueueService.addJobForUser(username, JOB_NAMES.FILE_UPLOAD_JOB, {
          username,
          fullPath: `${parentPath}/${folderName}/${entry.path}`,
          file: {
            fieldname: 'file',
            originalname: fileName,
            encoding: 'binary',
            buffer,
          } as CustomFile,

          mimeType,
          size: buffer.length,
          base64,
          total: totalFiles,
          processed: (processedZipContent += 1),
        });
      }),
    );

    return { success: true, status: HttpStatus.CREATED };
  }

  async duplicateFile(username: string, duplicateFile: DuplicateFileRequestDto) {
    let i = 0;
    return Promise.all(
      duplicateFile.destinationFilePaths.map(async (destinationPath) => {
        await this.dynamicQueueService.addJobForUser(username, JOB_NAMES.DUPLICATE_FILE_JOB, {
          username,
          originFilePath: duplicateFile.originFilePath,
          destinationFilePath: destinationPath,
          total: duplicateFile.destinationFilePaths.length,
          processed: (i += 1),
        });
      }),
    );
  }

  async copyFileOrFolder(username: string, copyFileRequestDTOs: PathChangeOrCreateProps[]) {
    let processedItems = 0;
    return Promise.all(
      copyFileRequestDTOs.map(async (copyFileRequest) => {
        const { path, newPath } = copyFileRequest;
        await this.dynamicQueueService.addJobForUser(username, JOB_NAMES.COPY_FILE_JOB, {
          username,
          originFilePath: path,
          destinationFilePath: newPath,
          total: copyFileRequestDTOs.length,
          processed: (processedItems += 1),
        });
      }),
    );
  }

  async collectFiles(
    username: string,
    collectFileRequestDTOs: CollectFileRequestDTO[],
    userRole: string,
    type: LmnApiCollectOperationsType,
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
        });
      }),
    );
  }

  async moveOrRenameResources(username: string, pathChangeOrCreateDtos: PathChangeOrCreateProps[]) {
    let processedItems = 0;
    return Promise.all(
      pathChangeOrCreateDtos.map(async (pathChange) => {
        const { path, newPath } = pathChange;
        await this.dynamicQueueService.addJobForUser(username, JOB_NAMES.MOVE_OR_RENAME_JOB, {
          username,
          path,
          newPath,
          total: pathChangeOrCreateDtos.length,
          processed: (processedItems += 1),
        });
      }),
    );
  }

  async deleteFileAtPath(username: string, paths: string[]) {
    let processedItems = 0;
    return Promise.all(
      paths.map(async (path) => {
        const fullPath = `${this.baseurl}${path}`;
        await this.dynamicQueueService.addJobForUser(username, JOB_NAMES.DELETE_FILE_JOB, {
          username,
          originFilePath: fullPath,
          webdavFilePath: path,
          total: paths.length,
          processed: (processedItems += 1),
        });
      }),
    );
  }

  async getWebDavFileStream(username: string, filePath: string): Promise<Readable> {
    try {
      const client = await this.webDavService.getClient(username);
      const decoded = decodeURIComponent(filePath).replace(/%(?![0-9A-F]{2})/gi, (s) => decodeURIComponent(s));
      const pathWithoutWebdav = getPathWithoutWebdav(decoded).replace(/^\/+/, '');
      const encodedPath = encodeURI(pathWithoutWebdav);

      const base = this.baseurl.replace(/\/+$/, '');
      const finalUrl = `${base}/${encodedPath}`;

      const resp = await FilesystemService.fetchFileStream(finalUrl, client);
      return resp instanceof Readable ? resp : resp.data;
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.DownloadFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `${username} ${filePath}`,
      );
    }
  }

  async fileLocation(username: string, filePath: string, filename: string): Promise<WebdavStatusResponse> {
    const client = await this.webDavService.getClient(username);
    return this.fileSystemService.fileLocation(username, filePath, filename, client);
  }

  async getOnlyOfficeToken(payload: string) {
    return this.onlyofficeService.generateOnlyOfficeToken(payload);
  }

  async handleCallback(req: Request, res: Response, path: string, filename: string, username: string) {
    return OnlyofficeService.handleCallback(req, res, path, filename, username, (user, uploadPath, file, name) =>
      this.webDavService.uploadFile(user, `${this.baseurl}${uploadPath}/${name}`, file),
    );
  }

  async streamFilesAsZipBuffered(username: string, paths: string[], res: Response) {
    const { path: tmpPath, cleanup } = await createTempFile('.zip');

    const output = createWriteStream(tmpPath);
    const zip = archiver('zip', { zlib: { level: 9 } });

    zip.pipe(output);

    const entries = await Promise.all(
      paths.map(async (p) => ({
        name: p.split('/').pop()!,
        stream: await this.getWebDavFileStream(username, p),
      })),
    );

    entries.forEach(({ stream, name }) => zip.append(stream, { name }));

    await zip.finalize();
    await once(output, 'close');

    const { size } = statSync(tmpPath);
    res.setHeader(HTTP_HEADERS.ContentType, RequestResponseContentType.APPLICATION_ZIP);
    res.setHeader(HTTP_HEADERS.ContentLength, size);

    createReadStream(tmpPath)
      .pipe(res)
      .on('finish', () => {
        void cleanup();
      });
  }

  async createPublicShare(
    currentUser: JwtUser,
    createPublicShareDto: CreateOrEditPublicShareDto,
  ): Promise<PublicShareResponseDto> {
    const { etag, filename, filePath, invitedAttendees, invitedGroups, password, expires, scope } =
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

  async getPublicShare(publicShareId: string, jwtUser: JwtUser | undefined, password?: string | undefined) {
    const share = await this.shareModel.findOne({ publicShareId }).lean().exec();
    if (!share) {
      throw new CustomHttpException(
        FileSharingErrorMessage.DownloadFailed,
        HttpStatus.NOT_FOUND,
        `${publicShareId} not found`,
      );
    }
    if (share.password && share.password !== password) {
      throw new CustomHttpException(
        FileSharingErrorMessage.PublicFileWrongPassword,
        HttpStatus.FORBIDDEN,
        `${publicShareId} wrong password`,
      );
    }

    const { invitedAttendees, invitedGroups } = share;

    const access = checkFileAccessRights(invitedAttendees, invitedGroups, jwtUser);

    if (access === FILE_ACCESS_RESULT.DENIED || access === FILE_ACCESS_RESULT.NO_TOKEN) {
      throw new CustomHttpException(
        FileSharingErrorMessage.PublicFileIsRestricted,
        HttpStatus.FORBIDDEN,
        `${publicShareId} not found`,
      );
    }

    const webDavUrl = `${this.baseurl}${getPathWithoutWebdav(share.filePath)}`;
    const client = await this.webDavService.getClient(share.creator.username);

    const stream = (await FilesystemService.fetchFileStream(webDavUrl, client, false)) as Readable;

    const fileType = await this.webDavService.getFileTypeFromWebdavPath(
      share.creator.username,
      webDavUrl,
      share.filePath,
    );

    const filename = fileType === ContentType.FILE ? share.filename : `${share.filename}.zip`;

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
