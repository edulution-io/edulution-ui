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

import { Injectable, HttpStatus } from '@nestjs/common';
import { Readable } from 'stream';
import { Request, Response } from 'express';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import CustomHttpException from '@libs/error/CustomHttpException';
import { WebdavStatusResponse } from '@libs/filesharing/types/fileOperationResult';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import { LmnApiCollectOperationsType } from '@libs/lmnApi/types/lmnApiCollectOperationsType';
import JOB_NAMES from '@libs/queue/constants/jobNames';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import WebdavService from '../webdav/webdav.service';
import OnlyofficeService from './onlyoffice.service';
import FilesystemService from '../filesystem/filesystem.service';
import QueueService from '../queue/queue.service';

@Injectable()
export default class FilesharingService {
  private readonly baseurl = process.env.EDUI_WEBDAV_URL as string;

  constructor(
    private readonly onlyofficeService: OnlyofficeService,
    private readonly fileSystemService: FilesystemService,
    private readonly dynamicQueueService: QueueService,
    private readonly webDavService: WebdavService,
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

  async deleteFileAtPath(username: string, paths: string[]) {
    let processedItems = 0;
    return Promise.all(
      paths.map(async (path) => {
        const fullPath = `${this.baseurl}${path}`;
        await this.dynamicQueueService.addJobForUser(username, JOB_NAMES.DELETE_FILE_JOB, {
          username,
          originFilePath: fullPath,
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

  async createFile(username: string, path: string, fileName: string, content = '') {
    const fullPath = `${this.baseurl}${getPathWithoutWebdav(path)}/${fileName}`;
    return this.webDavService.createFile(username, fullPath, content);
  }

  async moveOrRenameResource(username: string, originPath: string, newPath: string) {
    const originFull = `${this.baseurl}${originPath}`;
    const newFull = `${this.baseurl}${newPath}`;
    return this.webDavService.moveOrRenameResource(username, originFull, newFull);
  }
}
