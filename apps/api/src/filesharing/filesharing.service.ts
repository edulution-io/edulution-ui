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

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AxiosInstance, AxiosResponse } from 'axios';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import CustomHttpException from '@libs/error/CustomHttpException';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import ErrorMessage from '@libs/error/errorMessage';
import { HttpMethods, HttpMethodsWebDav, RequestResponseContentType } from '@libs/common/types/http-methods';
import { Readable } from 'stream';
import { WebdavStatusReplay } from '@libs/filesharing/types/fileOperationResult';
import CustomFile from '@libs/filesharing/types/customFile';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import process from 'node:process';
import { Request, Response } from 'express';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import FILE_PATHS from '@libs/filesharing/constants/file-paths';
import getCurrentTimestamp from '@libs/filesharing/utils/getCurrentTimestamp';
import { LmnApiCollectOperationsType } from '@libs/lmnApi/types/lmnApiCollectOperationsType';
import LMN_API_COLLECT_OPERATIONS from '@libs/lmnApi/constants/lmnApiCollectOperations';
import ContentType from '@libs/filesharing/types/contentType';
import { mapToDirectories, mapToDirectoryFiles } from './filesharing.utilities';
import UsersService from '../users/users.service';
import WebdavClientFactory from './webdav.client.factory';
import FilesystemService from '../filesystem/filesystem.service';
import OnlyofficeService from './onlyoffice.service';

@Injectable()
class FilesharingService {
  private clientCache = new Map<string, { client: AxiosInstance; timeout: NodeJS.Timeout }>();

  private readonly baseurl = process.env.EDUI_WEBDAV_URL as string;

  constructor(
    private readonly userService: UsersService,
    private readonly onlyofficeService: OnlyofficeService,
    private readonly fileSystemService: FilesystemService,
  ) {}

  private setCacheTimeout(token: string): NodeJS.Timeout {
    return setTimeout(
      () => {
        this.clientCache.delete(token);
      },
      30 * 60 * 1000,
    );
  }

  private async getClient(username: string): Promise<AxiosInstance> {
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
  ): Promise<T | WebdavStatusReplay> {
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

  createFolder = async (username: string, path: string, folderName: string): Promise<WebdavStatusReplay> => {
    const client = await this.getClient(username);
    const fullPath = `${this.baseurl}${path}/${folderName}`;

    Logger.log('Wanna to create folder', fullPath);

    return FilesharingService.executeWebdavRequest<WebdavStatusReplay>(
      client,
      {
        method: HttpMethodsWebDav.MKCOL,
        url: fullPath,
      },
      FileSharingErrorMessage.FolderCreationFailed,
      (response: WebdavStatusReplay) =>
        ({
          success: response?.status >= 200 && response?.status < 300,
          status: response.status,
        }) as WebdavStatusReplay,
    );
  };

  createFile = async (
    username: string,
    path: string,
    fileName: string,
    content: string = '',
  ): Promise<WebdavStatusReplay> => {
    const client = await this.getClient(username);
    const fullPath = `${this.baseurl}${getPathWithoutWebdav(path)}/${fileName}`;

    return FilesharingService.executeWebdavRequest<WebdavStatusReplay>(
      client,
      {
        method: HttpMethods.PUT,
        url: fullPath,
        headers: { 'Content-Type': RequestResponseContentType.TEXT_PLAIN },
        data: content,
      },
      FileSharingErrorMessage.CreationFailed,
      (response: WebdavStatusReplay) =>
        ({
          success: response.status >= 200 && response.status < 300,
          status: response.status,
        }) as WebdavStatusReplay,
    );
  };

  uploadFile = async (username: string, path: string, file: CustomFile, name: string): Promise<WebdavStatusReplay> => {
    const client = await this.getClient(username);
    const fullPath = `${this.baseurl}${path}/${name}`;
    return FilesharingService.executeWebdavRequest<WebdavStatusReplay>(
      client,
      {
        method: HttpMethods.PUT,
        url: fullPath,
        headers: { 'Content-Type': file.mimetype },
        data: file.buffer,
      },
      FileSharingErrorMessage.UploadFailed,
      (response: WebdavStatusReplay) =>
        ({
          success: response.status === 201 || response.status === 200,
          filename: file.originalname,
          status: response.status,
        }) as WebdavStatusReplay,
    );
  };

  deleteFileAtPath = async (username: string, path: string): Promise<WebdavStatusReplay> => {
    const client = await this.getClient(username);
    const fullPath = `${this.baseurl}${path}`;

    return FilesharingService.executeWebdavRequest<WebdavStatusReplay>(
      client,
      {
        method: HttpMethods.DELETE,
        url: fullPath,
        headers: { 'Content-Type': RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED },
      },
      FileSharingErrorMessage.DeletionFailed,
      (response: WebdavStatusReplay) =>
        ({
          success: response.status >= 200 && response.status < 300,
          status: response.status,
        }) as WebdavStatusReplay,
    );
  };

  moveOrRenameResource = async (username: string, originPath: string, newPath: string): Promise<WebdavStatusReplay> => {
    const client = await this.getClient(username);
    const fullOriginPath = `${this.baseurl}${originPath}`;
    const fullNewPath = `${this.baseurl}${newPath}`;

    return FilesharingService.executeWebdavRequest<WebdavStatusReplay>(
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
      (response: WebdavStatusReplay) => ({
        success: response.status >= 200 && response.status < 300,
        status: response.status,
      }),
    );
  };

  private async createCollectFolderIfNotExists(username: string, destinationPath: string) {
    const sanitizedDestinationPath = destinationPath.replace(`${FILE_PATHS.COLLECT}/`, '');
    const pathWithoutFilename = sanitizedDestinationPath.slice(0, sanitizedDestinationPath.lastIndexOf('/'));
    try {
      await this.createFolder(username, pathWithoutFilename, FILE_PATHS.COLLECT);
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.CreationFailed,
        HttpStatus.NOT_FOUND,
        error,
        FilesharingService.name,
      );
    }
  }

  private static async copyFile(client: AxiosInstance, originPath: string, destinationPath: string) {
    const sanitizedDestinationPath = destinationPath.replace(/\u202F/g, ' ');
    try {
      await FilesharingService.copyFileViaWebDAV(client, originPath, sanitizedDestinationPath);
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.DuplicateFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  cutCollectedItems = async (username: string, originPath: string, newPath: string): Promise<WebdavStatusReplay> => {
    const result = await this.moveOrRenameResource(username, originPath, newPath);

    try {
      await this.createCollectFolderIfNotExists(username, originPath);
    } catch (error) {
      Logger.error(error);
    }
    return result;
  };

  copyCollectedItems = async (
    username: string,
    duplicateFile: DuplicateFileRequestDto,
  ): Promise<WebdavStatusReplay> => {
    const client = await this.getClient(username);

    const duplicationPromises = duplicateFile.destinationFilePaths.map(async (destinationPath) => {
      await this.createCollectFolderIfNotExists(username, destinationPath);
      await FilesharingService.copyFile(client, duplicateFile.originFilePath, destinationPath);
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
    name: string, // folderName or filename
    contentType: ContentType, // 'DIRECTORY' or 'FILE'
  ): Promise<boolean> {
    if (contentType === ContentType.DIRECTORY) {
      // 1) List directories at `parentPath`
      const directories = await this.getDirAtPath(username, `${parentPath}/`);

      // 2) Build a set of directory basenames
      const existingFolders = new Set(
        directories.filter((item) => item.type === ContentType.DIRECTORY).map((item) => item.basename),
      );

      // Debug logs
      Logger.log('Looking for directory:', name);
      return existingFolders.has(name);
    }
    if (contentType === ContentType.FILE) {
      // 1) List files at `parentPath`
      const files = await this.getFilesAtPath(username, parentPath);

      // 2) Build a set of file basenames
      const existingFiles = new Set(
        files.filter((item) => item.type === ContentType.FILE).map((item) => item.basename),
      );

      // Debug logs
      Logger.log('Looking for file:', name);
      return existingFiles.has(name);
    }
    return false;
  }

  static splitPathAndLastSegment(fullPath: string): { parentPath: string; lastSegment: string } {
    const trimmed = fullPath.replace(/\/+$/, '');
    const lastSlashIndex = trimmed.lastIndexOf('/');
    if (lastSlashIndex === -1) {
      return { parentPath: '', lastSegment: trimmed };
    }
    return {
      parentPath: trimmed.slice(0, lastSlashIndex),
      lastSegment: trimmed.slice(lastSlashIndex + 1),
    };
  }

  duplicateFile = async (username: string, duplicateFile: DuplicateFileRequestDto): Promise<WebdavStatusReplay> => {
    const client = await this.getClient(username);

    const promises = duplicateFile.destinationFilePaths.map(async (destinationPath) => {
      const filesAfterTransfer = FilesharingService.getPathUntilFolder(destinationPath, FILE_PATHS.TRANSFER);
      const filesAfterTeacherFolder = FilesharingService.getPathUntilFolder(destinationPath, username);

      const userFolderExists = await this.checkIfFileOrFolderExists(
        username,
        filesAfterTransfer,
        username,
        ContentType.DIRECTORY,
      );

      if (!userFolderExists) {
        Logger.log('Creating folder', filesAfterTransfer, username);
        await this.createFolder(username, filesAfterTransfer, username);
      }

      if (!userFolderExists) {
        const collectFolderExists = await this.checkIfFileOrFolderExists(
          username,
          filesAfterTeacherFolder,
          FILE_PATHS.COLLECT,
          ContentType.DIRECTORY,
        );
        if (!collectFolderExists) {
          Logger.log('Creating folder', filesAfterTeacherFolder, FILE_PATHS.COLLECT);
          await this.createFolder(username, filesAfterTeacherFolder, FILE_PATHS.COLLECT);
        }
      }

      const { parentPath, lastSegment } = FilesharingService.splitPathAndLastSegment(destinationPath);

      const exists =
        (await this.checkIfFileOrFolderExists(username, parentPath, lastSegment, ContentType.DIRECTORY)) ||
        (await this.checkIfFileOrFolderExists(username, parentPath, lastSegment, ContentType.FILE));

      if (!exists) {
        await FilesharingService.copyFile(client, duplicateFile.originFilePath, destinationPath);
      }
    });

    await Promise.all(promises);

    return { success: true, status: HttpStatus.OK };
  };

  async getWebDavFileStream(username: string, filePath: string): Promise<Readable> {
    try {
      const client = await this.getClient(username);
      const url = `${this.baseurl}${getPathWithoutWebdav(filePath)}`;
      const resp = await FilesystemService.fetchFileStream(url, client);
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

  async fileLocation(username: string, filePath: string, filename: string): Promise<WebdavStatusReplay> {
    const client = await this.getClient(username);
    return this.fileSystemService.fileLocation(username, filePath, filename, client);
  }

  async getOnlyOfficeToken(payload: string) {
    return this.onlyofficeService.generateOnlyOfficeToken(payload);
  }

  static async deleteFileFromServer(path: string): Promise<void> {
    try {
      await FilesystemService.deleteFile(path);
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.DeletionFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
            destinationFilePaths: [`${item.destinationPath}${getCurrentTimestamp()}`],
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

  private static async copyFileViaWebDAV(
    client: AxiosInstance,
    originPath: string,
    destinationPath: string,
  ): Promise<WebdavStatusReplay> {
    return FilesharingService.executeWebdavRequest<WebdavStatusReplay>(
      client,
      {
        method: HttpMethodsWebDav.COPY,
        url: originPath,
        headers: {
          Destination: destinationPath,
        },
      },
      FileSharingErrorMessage.DuplicateFailed,
      (response: WebdavStatusReplay) => ({
        success: response.status >= 200 && response.status < 300,
        status: response.status,
      }),
    );
  }
}

export default FilesharingService;
