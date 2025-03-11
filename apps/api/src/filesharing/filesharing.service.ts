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
import { AxiosInstance, AxiosResponse } from 'axios';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import CustomHttpException from '@libs/error/CustomHttpException';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import ErrorMessage from '@libs/error/errorMessage';
import { HttpMethods, HttpMethodsWebDav, RequestResponseContentType } from '@libs/common/types/http-methods';
import { Readable } from 'stream';
import { WebdavStatusResponse } from '@libs/filesharing/types/fileOperationResult';
import CustomFile from '@libs/filesharing/types/customFile';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import process from 'node:process';
import { Request, Response } from 'express';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import FILE_PATHS from '@libs/filesharing/constants/file-paths';
import { LmnApiCollectOperationsType } from '@libs/lmnApi/types/lmnApiCollectOperationsType';
import LMN_API_COLLECT_OPERATIONS from '@libs/lmnApi/constants/lmnApiCollectOperations';
import ContentType from '@libs/filesharing/types/contentType';
import { mapToDirectories, mapToDirectoryFiles } from './filesharing.utilities';
import UsersService from '../users/users.service';
import WebdavClientFactory from './webdav.client.factory';
import FilesystemService from '../filesystem/filesystem.service';
import OnlyofficeService from './onlyoffice.service';
import GenericQueueService from '../generic-queue/generic-queue.service';

@Injectable()
class FilesharingService {
  private clientCache = new Map<string, { client: AxiosInstance; timeout: NodeJS.Timeout }>();

  private readonly baseurl = process.env.EDUI_WEBDAV_URL as string;

  constructor(
    private readonly userService: UsersService,
    private readonly onlyofficeService: OnlyofficeService,
    private readonly fileSystemService: FilesystemService,
    private readonly genericQueueService: GenericQueueService,
  ) {}

  private setCacheTimeout(token: string): NodeJS.Timeout {
    return setTimeout(
      () => {
        this.clientCache.delete(token);
      },
      30 * 60 * 1000,
    );
  }

  async getClient(username: string): Promise<AxiosInstance> {
    if (!this.clientCache.has(username)) {
      await this.initializeClient(username);
    } else {
      clearTimeout(this.clientCache.get(username)!.timeout);
      this.clientCache.get(username)!.timeout = this.setCacheTimeout(username);
    }
    const client = this.clientCache.get(username)?.client;
    if (!client) {
      throw new Error(`Failed to initialize WebDAV client for token ${username}`);
    }
    return client;
  }

  private async initializeClient(username: string): Promise<void> {
    const password = await this.userService.getPassword(username);
    const client = WebdavClientFactory.createWebdavClient(this.baseurl, username, password);
    const timeout = this.setCacheTimeout(username);
    this.clientCache.set(username, { client, timeout });
  }

  private static handleWebDAVError(response: AxiosResponse) {
    if (!response || !(response.status >= 200 || response.status >= 300)) {
      throw new CustomHttpException(
        FileSharingErrorMessage.WebDavError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        response.statusText || 'WebDAV request failed',
      );
    }
  }

  private static async executeWebdavRequest<T>(
    client: AxiosInstance,
    config: {
      method: string;
      url?: string;
      // eslint-disable-next-line
      data?: string | Record<string, any> | Buffer;
      headers?: Record<string, string | number>;
    },
    fileSharingErrorMessage: ErrorMessage,
    // eslint-disable-next-line
    transformer?: (data: any) => T,
    showDebugMessage?: boolean,
  ): Promise<T | WebdavStatusResponse> {
    try {
      const response = await client(config);
      FilesharingService.handleWebDAVError(response);
      return transformer ? transformer(response.data) : (response.data as T);
    } catch (error) {
      if (showDebugMessage) {
        throw new CustomHttpException(fileSharingErrorMessage, HttpStatus.NOT_FOUND, error, FilesharingService.name);
      }
      throw new CustomHttpException(
        fileSharingErrorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
        '',
        FilesharingService.name,
      );
    }
  }

  private readonly webdavXML: string =
    '<?xml version="1.0"?>\n' +
    '<d:propfind xmlns:d="DAV:">\n' +
    '  <d:prop>\n' +
    '    <d:getlastmodified />\n' +
    '    <d:getetag />\n' +
    '    <d:getcontenttype />\n' +
    '    <d:getcontentlength />\n' +
    '    <d:displayname />\n' +
    '    <d:creationdate />\n' +
    '  </d:prop>\n' +
    '</d:propfind>\n';

  getFilesAtPath = async (username: string, path: string): Promise<DirectoryFileDTO[]> => {
    const client = await this.getClient(username);
    return (await FilesharingService.executeWebdavRequest<DirectoryFileDTO[]>(
      client,
      {
        method: HttpMethodsWebDav.PROPFIND,
        url: this.baseurl + getPathWithoutWebdav(path),
        data: this.webdavXML,
      },
      FileSharingErrorMessage.FileNotFound,
      mapToDirectoryFiles,
    )) as DirectoryFileDTO[];
  };

  getDirAtPath = async (username: string, path: string): Promise<DirectoryFileDTO[]> => {
    const client = await this.getClient(username);
    return (await FilesharingService.executeWebdavRequest<DirectoryFileDTO[]>(
      client,
      {
        method: HttpMethodsWebDav.PROPFIND,
        url: this.baseurl + getPathWithoutWebdav(path),
        data: this.webdavXML,
        headers: { 'Content-Type': RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED },
      },
      FileSharingErrorMessage.FolderNotFound,
      mapToDirectories,
    )) as DirectoryFileDTO[];
  };

  createFolder = async (username: string, path: string, folderName: string): Promise<WebdavStatusResponse> => {
    const client = await this.getClient(username);
    const fullPath = `${this.baseurl}${path}/${folderName}`;

    return FilesharingService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethodsWebDav.MKCOL,
        url: fullPath,
      },
      FileSharingErrorMessage.FolderCreationFailed,
      (response: WebdavStatusResponse) =>
        ({
          success: response?.status >= 200 && response?.status < 300,
          status: response.status,
        }) as WebdavStatusResponse,
    );
  };

  createFile = async (
    username: string,
    path: string,
    fileName: string,
    content: string = '',
  ): Promise<WebdavStatusResponse> => {
    const client = await this.getClient(username);
    const fullPath = `${this.baseurl}${getPathWithoutWebdav(path)}/${fileName}`;

    return FilesharingService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethods.PUT,
        url: fullPath,
        headers: { 'Content-Type': RequestResponseContentType.TEXT_PLAIN },
        data: content,
      },
      FileSharingErrorMessage.CreationFailed,
      (response: WebdavStatusResponse) =>
        ({
          success: response.status >= 200 && response.status < 300,
          status: response.status,
        }) as WebdavStatusResponse,
    );
  };

  uploadFile = async (
    username: string,
    path: string,
    file: CustomFile,
    name: string,
  ): Promise<WebdavStatusResponse> => {
    const client = await this.getClient(username);
    const fullPath = `${this.baseurl}${path}/${name}`;
    return FilesharingService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethods.PUT,
        url: fullPath,
        headers: { 'Content-Type': file.mimetype },
        data: file.buffer,
      },
      FileSharingErrorMessage.UploadFailed,
      (response: WebdavStatusResponse) =>
        ({
          success: response.status === 201 || response.status === 200,
          filename: file.originalname,
          status: response.status,
        }) as WebdavStatusResponse,
    );
  };

  deleteFileAtPath = async (username: string, path: string): Promise<WebdavStatusResponse> => {
    const client = await this.getClient(username);
    const fullPath = `${this.baseurl}${path}`;

    return FilesharingService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethods.DELETE,
        url: fullPath,
        headers: { 'Content-Type': RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED },
      },
      FileSharingErrorMessage.DeletionFailed,
      (response: WebdavStatusResponse) =>
        ({
          success: response.status >= 200 && response.status < 300,
          status: response.status,
        }) as WebdavStatusResponse,
    );
  };

  static getStudentNameFromPath = (filePath: string): string | null => {
    const parts = filePath.split('/');
    if (parts.length < 3) {
      return null;
    }
    return parts[2];
  };

  moveOrRenameResource = async (
    username: string,
    originPath: string,
    newPath: string,
  ): Promise<WebdavStatusResponse> => {
    const client = await this.getClient(username);
    const fullOriginPath = `${this.baseurl}${originPath}`;
    const fullNewPath = `${this.baseurl}${newPath}`;

    return FilesharingService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethodsWebDav.MOVE,
        url: fullOriginPath,
        headers: {
          Destination: fullNewPath,
          'Content-Type': RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED,
        },
      },
      FileSharingErrorMessage.RenameFailed,
      (response: WebdavStatusResponse) => ({
        success: response.status >= 200 && response.status < 300,
        status: response.status,
      }),
    );
  };

  async duplicateFile(username: string, duplicateFile: DuplicateFileRequestDto) {
    await this.genericQueueService.addJob('duplicate-file', {
      username,
      originFilePath: duplicateFile.originFilePath,
      destinationFilePaths: duplicateFile.destinationFilePaths,
    });
  }

  private async createCollectFolderIfNotExists(username: string, destinationPath: string) {
    const sanitizedDestinationPath = destinationPath.replace(`${FILE_PATHS.COLLECT}/`, '');
    const pathWithoutFilename = sanitizedDestinationPath.slice(0, sanitizedDestinationPath.lastIndexOf('/'));

    const folderAlreadyExistis = await this.checkIfFileOrFolderExists(
      username,
      `${pathWithoutFilename}/`,
      FILE_PATHS.COLLECT,
      ContentType.DIRECTORY,
    );

    if (folderAlreadyExistis) return;

    try {
      await this.createFolder(username, pathWithoutFilename, FILE_PATHS.COLLECT);
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.CreationFailed,
        HttpStatus.NOT_FOUND,
        pathWithoutFilename,
        FilesharingService.name,
      );
    }
  }

  async cutCollectedItems(username: string, originPath: string, newPath: string): Promise<WebdavStatusResponse> {
    const result = await this.moveOrRenameResource(username, originPath, newPath);

    try {
      await this.createCollectFolderIfNotExists(username, originPath);
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.CollectingFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        originPath,
        FilesharingService.name,
      );
    }
    return result;
  }

  copyCollectedItems = async (
    username: string,
    duplicateFile: DuplicateFileRequestDto,
  ): Promise<WebdavStatusResponse> => {
    const client = await this.getClient(username);

    const duplicationPromises = duplicateFile.destinationFilePaths.map(async (destinationPath) => {
      await FilesharingService.copyFileViaWebDAV(client, duplicateFile.originFilePath, destinationPath);
    });

    try {
      await Promise.all(duplicationPromises);
      return { success: true, status: HttpStatus.OK };
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.SharingFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };

  static getPathUntilFolder(fullPath: string, folderName: string): string {
    const segments = fullPath.split('/');
    const index = segments.indexOf(folderName);

    if (index === -1) {
      return fullPath;
    }
    const partialSegments = segments.slice(0, index + 1);
    return partialSegments.join('/');
  }

  async checkIfFileOrFolderExists(
    username: string,
    parentPath: string,
    name: string,
    contentType: ContentType,
  ): Promise<boolean> {
    if (contentType === ContentType.DIRECTORY) {
      const directories = await this.getDirAtPath(username, `${parentPath}/`);
      return directories.some((item) => item.type === ContentType.DIRECTORY && item.basename === name);
    }

    return false;
  }

  async getWebDavFileStream(username: string, filePath: string): Promise<Readable> {
    try {
      const client = await this.getClient(username);
      let decoded = decodeURIComponent(filePath);

      if (decoded.includes('%')) {
        decoded = decodeURIComponent(decoded);
      }

      const pathWithoutWebdav = getPathWithoutWebdav(decoded).replace(/^\/+/, '');

      const encodedPath = encodeURI(pathWithoutWebdav);

      const base = this.baseurl.replace(/\/+$/, '');
      const finalUrl = `${base}/${encodedPath}`;

      const resp = await FilesystemService.fetchFileStream(finalUrl, client);
      if (resp instanceof Readable) {
        return resp;
      }
      return resp.data;
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.DownloadFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `${username} ${filePath}`,
      );
    }
  }

  async fileLocation(username: string, filePath: string, filename: string): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username);
    return this.fileSystemService.fileLocation(username, filePath, filename, client);
  }

  async getOnlyOfficeToken(payload: string) {
    return this.onlyofficeService.generateOnlyOfficeToken(payload);
  }

  async handleCallback(req: Request, res: Response, path: string, filename: string, username: string) {
    return OnlyofficeService.handleCallback(req, res, path, filename, username, this.uploadFile);
  }

  async collectFiles(
    username: string,
    collectFileRequestDTO: CollectFileRequestDTO[],
    userRole: string,
    type: LmnApiCollectOperationsType,
  ) {
    if (!collectFileRequestDTO || collectFileRequestDTO.length === 0) {
      throw new Error('collectFileRequestDTO is empty or undefined');
    }
    const initFolderName = `${userRole}s/${username}/${FILE_PATHS.TRANSFER}/${FILE_PATHS.COLLECTED}`;

    await this.createFolder(username, initFolderName, collectFileRequestDTO[0].newFolderName);
    const operations = collectFileRequestDTO.map(async (item) => {
      try {
        await this.createFolder(username, `${initFolderName}/${item.newFolderName}`, item.userName);

        if (type === LMN_API_COLLECT_OPERATIONS.CUT) {
          await this.cutCollectedItems(username, item.originPath, item.destinationPath);
        } else {
          await this.copyCollectedItems(username, {
            originFilePath: item.originPath,
            destinationFilePaths: [`${item.destinationPath}`],
          });
        }
      } catch (error) {
        throw new Error(`Operation failed for user ${item.userName}`);
      }
    });

    const results = await Promise.allSettled(operations);

    const failedTasks = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');

    if (failedTasks.length > 0) {
      throw new CustomHttpException(FileSharingErrorMessage.CollectingFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  static async copyFileViaWebDAV(
    client: AxiosInstance,
    originPath: string,
    destinationPath: string,
  ): Promise<WebdavStatusResponse> {
    const sanitizedDestinationPath = destinationPath.replace(/\u202F/g, ' ');
    return FilesharingService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethodsWebDav.COPY,
        url: originPath,
        headers: {
          Destination: sanitizedDestinationPath,
        },
      },
      FileSharingErrorMessage.DuplicateFailed,
      (response: WebdavStatusResponse) => ({
        success: response.status >= 200 && response.status < 300,
        status: response.status,
      }),
    );
  }
}

export default FilesharingService;
