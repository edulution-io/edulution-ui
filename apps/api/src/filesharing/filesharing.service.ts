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
import { createReadStream, createWriteStream, readFileSync, statSync } from 'fs';
import createTempFile from '@libs/filesystem/utils/createTempFile';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import ContentType from '@libs/filesharing/types/contentType';
import { JwtService } from '@nestjs/jwt';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import PUBLIC_KEY_FILE_PATH from '@libs/common/constants/pubKeyFilePath';
import FILE_ACCESS_RESULT from '@libs/filesharing/constants/fileAccessResult';
import checkFileAccessRights from '@libs/filesharing/utils/checkFileAccessRights';
import CreateEditPublicFileShareDto from '@libs/filesharing/types/createEditPublicFileShareDto';
import PublicFileShareDto from '@libs/filesharing/types/publicFileShareDto';
import { v4 as uuidv4 } from 'uuid';
import { PublicFileShare, PublicFileShareDocument } from './publicFileShare.schema';
import UsersService from '../users/users.service';
import WebdavService from '../webdav/webdav.service';
import OnlyofficeService from './onlyoffice.service';
import FilesystemService from '../filesystem/filesystem.service';
import QueueService from '../queue/queue.service';
import CustomHttpException from '../common/CustomHttpException';

@Injectable()
class FilesharingService {
  private readonly baseurl = process.env.EDUI_WEBDAV_URL as string;

  private readonly publicKey = readFileSync(PUBLIC_KEY_FILE_PATH, 'utf8');

  constructor(
    @InjectModel(PublicFileShare.name)
    private readonly shareModel: Model<PublicFileShareDocument>,
    private readonly onlyofficeService: OnlyofficeService,
    private readonly fileSystemService: FilesystemService,
    private readonly dynamicQueueService: QueueService,
    private readonly webDavService: WebdavService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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

  async generateFileLink(
    username: string,
    createPublicFileShareDto: CreateEditPublicFileShareDto,
  ): Promise<WebdavStatusResponse> {
    const { etag, filename, filePath, invitedAttendees, invitedGroups, password, expires } = createPublicFileShareDto;

    const validUntil = expires;
    try {
      const user = await this.userService.findOne(username);
      if (!user) {
        return { success: false, status: HttpStatus.INTERNAL_SERVER_ERROR } as WebdavStatusResponse;
      }

      const shareId = uuidv4();
      const fileLink = `${EDU_API_ROOT}/${FileSharingApiEndpoints.BASE}/${FileSharingApiEndpoints.PUBLIC_FILE_SHARE_DOWNLOAD}/${shareId}`;
      const publicFileLink = `${FileSharingApiEndpoints.PUBLIC_FILE_SHARE}/${shareId}`;
      await this.shareModel.create({
        _id: shareId,
        etag,
        filename,
        filePath,
        validUntil,
        creator: username,
        accessibleByUser: invitedAttendees,
        accessibleByGroup: invitedGroups,
        publicFileLink,
        password,
        expires,
        fileLink,
      });

      return {
        success: true,
        status: HttpStatus.OK,
        data: shareId,
      };
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.SharingFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async listOwnPublicShares(username: string) {
    return this.shareModel.find({ creator: username }).sort({ validUntil: 1 }).lean().exec();
  }

  async getPublicFileShare(fileId: string, jwt?: string, password?: string | undefined) {
    const share = await this.shareModel.findById(fileId).lean().exec();
    if (!share) {
      throw new CustomHttpException(
        FileSharingErrorMessage.DownloadFailed,
        HttpStatus.NOT_FOUND,
        `${fileId} not found}`,
      );
    }
    if (share.password !== password) {
      if (share.password) {
        throw new CustomHttpException(
          FileSharingErrorMessage.PublicFileWrongPassword,
          HttpStatus.FORBIDDEN,
          `${fileId} wrong password}`,
        );
      }
    }

    let jwtUser: JwtUser | null = null;
    const token = jwt?.replace(/^Bearer\s*/i, '').trim();
    const jwtToken = token || undefined;
    if (jwtToken) {
      try {
        jwtUser = await this.jwtService.verifyAsync<JwtUser>(jwtToken, {
          publicKey: this.publicKey,
          algorithms: ['RS256'],
        });
      } catch {
        throw new CustomHttpException(
          FileSharingErrorMessage.PublicIsRestrictedByInvalidToken,
          HttpStatus.INTERNAL_SERVER_ERROR,
          `${fileId} not found}`,
        );
      }
    }

    const { invitedAttendees, invitedGroups } = share;

    const access = checkFileAccessRights(invitedAttendees, invitedGroups, jwtUser);

    if (access === FILE_ACCESS_RESULT.DENIED || access === FILE_ACCESS_RESULT.NO_TOKEN) {
      throw new CustomHttpException(
        FileSharingErrorMessage.PublicFileIsRestricted,
        HttpStatus.FORBIDDEN,
        `${fileId} not found}`,
      );
    }

    const webDavUrl = `${this.baseurl}${getPathWithoutWebdav(share.filePath)}`;
    const client = await this.webDavService.getClient(share.creator);

    const stream = (await FilesystemService.fetchFileStream(webDavUrl, client, false)) as Readable;

    const fileType = await this.webDavService.getFileTypeFromWebdavPath(share.creator, webDavUrl, share.filePath);

    const filename = fileType === ContentType.FILE ? share.filename : `${share.filename}.zip`;

    return { stream, filename, fileType };
  }

  async getPublicFileShareInfo(shareId: string, jwt?: string) {
    const doc = await this.shareModel.findById(shareId).lean().exec();

    if (!doc) {
      return { status: HttpStatus.NOT_FOUND };
    }
    const requiresPassword = !!doc.password?.trim();

    const data = { ...doc };
    delete data.password;

    let jwtUser: JwtUser | null = null;

    const token = jwt?.replace(/^Bearer\s*/i, '').trim();
    const jwtToken = token || undefined;

    if (jwtToken) {
      try {
        jwtUser = await this.jwtService.verifyAsync<JwtUser>(jwtToken, {
          publicKey: this.publicKey,
          algorithms: ['RS256'],
        });
      } catch {
        return { success: false, status: HttpStatus.UNAUTHORIZED };
      }
    }

    const { invitedAttendees, invitedGroups } = data;

    switch (checkFileAccessRights(invitedAttendees, invitedGroups, jwtUser)) {
      case FILE_ACCESS_RESULT.PUBLIC:
      case FILE_ACCESS_RESULT.USER_MATCH:
      case FILE_ACCESS_RESULT.GROUP_MATCH:
        return { success: true, status: HttpStatus.OK, requiresPassword, data };

      case FILE_ACCESS_RESULT.NO_TOKEN:
        return { success: false, status: HttpStatus.FORBIDDEN };

      case FILE_ACCESS_RESULT.DENIED:
      default:
        return { success: false, status: HttpStatus.FORBIDDEN };
    }
  }

  async deletePublicShares(username: string, publicFiles: PublicFileShareDto[]) {
    const ids = publicFiles.map(({ _id: id }) => id);

    const docs = await this.shareModel
      .find({ _id: { $in: ids } })
      .select('creator')
      .lean()
      .exec();

    if (docs.length !== ids.length) {
      throw new CustomHttpException(
        FileSharingErrorMessage.PublicFileNotFound,
        HttpStatus.NOT_FOUND,
        `${username} ${ids.join(', ')}`,
      );
    }

    const foreignShare = docs.find((d) => d.creator !== username);
    if (foreignShare) {
      throw new CustomHttpException(
        FileSharingErrorMessage.PublicFileIsOnlyDeletableByOwner,
        HttpStatus.FORBIDDEN,
        `${username} ${ids.join(', ')}`,
      );
    }

    const { deletedCount } = await this.shareModel.deleteMany({ _id: { $in: ids }, creator: username }).exec();

    return { success: true, deletedCount };
  }

  async editPublicShareFile(username: string, dto: PublicFileShareDto) {
    const { _id: id, expires, invitedGroups, invitedAttendees, password } = dto;

    const share = await this.shareModel.findById(id).where({ creator: username });
    if (!share)
      throw new CustomHttpException(
        FileSharingErrorMessage.PublicFileNotFound,
        HttpStatus.NOT_FOUND,
        `${username} ${share}`,
      );

    if (expires) {
      share.expires = expires;
    }

    if (invitedAttendees) share.invitedAttendees = invitedAttendees;
    if (invitedGroups) share.invitedGroups = invitedGroups;

    if (password !== undefined) {
      share.password = password || '';
    }

    await share.save();
  }
}

export default FilesharingService;
