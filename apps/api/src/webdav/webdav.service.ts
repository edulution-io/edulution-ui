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
import { OnEvent } from '@nestjs/event-emitter';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import { WebdavStatusResponse } from '@libs/filesharing/types/fileOperationResult';
import {
  HTTP_HEADERS,
  HttpMethods,
  HttpMethodsWebDav,
  RequestResponseContentType,
  WebdavRequestDepth,
} from '@libs/common/types/http-methods';
import ContentType from '@libs/filesharing/types/contentType';
import FILE_PATHS from '@libs/filesharing/constants/file-paths';
import ErrorMessage from '@libs/error/errorMessage';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import mapToDirectories from '@libs/filesharing/utils/mapToDirectories';
import mapToDirectoryFiles from '@libs/filesharing/utils/mapToDirectoryFiles';
import DEFAULT_PROPFIND_XML from '@libs/filesharing/constants/defaultPropfindXml';
import WEBDAV_SHARE_TYPE from '@libs/filesharing/constants/webdavShareType';
import { Readable } from 'stream';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import CustomHttpException from '../common/CustomHttpException';
import WebdavClientFactory from './webdav.client.factory';
import UsersService from '../users/users.service';
import WebdavSharesService from './shares/webdav-shares.service';

@Injectable()
class WebdavService {
  private webdavClientCache = new Map<string, { client: AxiosInstance; timeout: NodeJS.Timeout }>();

  constructor(
    private readonly usersService: UsersService,
    private readonly webdavSharesService: WebdavSharesService,
  ) {}

  @OnEvent(EVENT_EMITTER_EVENTS.WEBDAV_BASEURL_CHANGED)
  invalidateClientCache() {
    this.webdavClientCache.clear();
  }

  static async executeWebdavRequest<Raw = unknown, Result = Raw>(
    client: AxiosInstance,
    config: {
      method: string;
      url?: string;
      data?: string | Record<string, unknown> | Readable | Buffer;
      headers?: Record<string, string | number>;
      maxContentLength?: number;
      maxBodyLength?: number;
      timeout?: number;
    },
    fileSharingErrorMessage: ErrorMessage,
    transformer?: (data: Raw) => Result,
  ): Promise<Result | WebdavStatusResponse> {
    try {
      const response = await client.request<Raw>(config);
      WebdavService.handleWebDAVError(response);
      return transformer ? transformer(response.data) : (response.data as unknown as Result);
    } catch (error) {
      throw new CustomHttpException(
        fileSharingErrorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
        (error as Error).message,
        WebdavService.name,
      );
    }
  }

  private static handleWebDAVError(response: AxiosResponse) {
    if (!response || response.status < 200 || response.status >= 300) {
      throw new CustomHttpException(
        FileSharingErrorMessage.WebDavError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        response?.statusText || 'WebDAV request failed',
        WebdavService.name,
      );
    }
  }

  scheduleClientTimeout(token: string): NodeJS.Timeout {
    return setTimeout(
      () => {
        this.webdavClientCache.delete(token);
      },
      30 * 60 * 1000,
    );
  }

  async initializeClient(username: string): Promise<void> {
    const password = await this.usersService.getPassword(username);
    const baseUrl = await this.webdavSharesService.getWebdavSharePath();
    const client = WebdavClientFactory.createWebdavClient(baseUrl, username, password);
    const timeout = this.scheduleClientTimeout(username);
    this.webdavClientCache.set(username, { client, timeout });
  }

  public async getClient(username: string): Promise<AxiosInstance> {
    if (!this.webdavClientCache.has(username)) {
      await this.initializeClient(username);
    } else {
      clearTimeout(this.webdavClientCache.get(username)!.timeout);
      this.webdavClientCache.get(username)!.timeout = this.scheduleClientTimeout(username);
    }
    const client = this.webdavClientCache.get(username)?.client;
    if (!client) {
      throw new CustomHttpException(
        FileSharingErrorMessage.WebDavError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to initialize WebDAV client for user: ${username}`,
      );
    }
    return client;
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  getPathUntilFolder(fullPath: string, folderName: string): string {
    const segments = fullPath.split('/');
    const index = segments.indexOf(folderName);

    if (index === -1) {
      return fullPath;
    }
    const partialSegments = segments.slice(0, index + 1);
    return partialSegments.join('/');
  }

  async ensureFolderExists(username: string, basePath: string, folderName: string) {
    const exists = await this.checkIfFolderExists(username, basePath, folderName);
    if (!exists) {
      await this.createFolder(username, basePath, folderName);
    }
  }

  async getFilesAtPath(username: string, path: string): Promise<DirectoryFileDTO[]> {
    const client = await this.getClient(username);
    const baseUrl = await this.webdavSharesService.getWebdavSharePath();
    const url = new URL(path.replace(/^\/+/, ''), baseUrl).href;
    return (await WebdavService.executeWebdavRequest<string, DirectoryFileDTO[]>(
      client,
      {
        method: HttpMethodsWebDav.PROPFIND,
        url,
        data: DEFAULT_PROPFIND_XML,
        headers: {
          [HTTP_HEADERS.Depth]: WebdavRequestDepth.ONE_LEVEL,
        },
      },
      FileSharingErrorMessage.FileNotFound,
      mapToDirectoryFiles,
    )) as DirectoryFileDTO[];
  }

  async getDirectoryAtPath(username: string, path: string): Promise<DirectoryFileDTO[]> {
    const client = await this.getClient(username);
    const baseUrl = await this.webdavSharesService.getWebdavSharePath();
    const url = new URL(path.replace(/^\/+/, ''), baseUrl).href;

    return (await WebdavService.executeWebdavRequest<string, DirectoryFileDTO[]>(
      client,
      {
        method: HttpMethodsWebDav.PROPFIND,
        url,
        data: DEFAULT_PROPFIND_XML,
        headers: {
          [HTTP_HEADERS.Depth]: WebdavRequestDepth.ONE_LEVEL,
        },
      },
      FileSharingErrorMessage.FolderNotFound,
      mapToDirectories,
    )) as DirectoryFileDTO[];
  }

  async createFolder(username: string, path: string, folderName: string): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username);
    const baseUrl = await this.webdavSharesService.getWebdavSharePath();
    const fullPath = `${baseUrl}${path}/${folderName}`;

    return WebdavService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethodsWebDav.MKCOL,
        url: fullPath,
      },
      FileSharingErrorMessage.FolderCreationFailed,
      (resp: WebdavStatusResponse) => ({
        success: resp?.status >= 200 && resp?.status < 300,
        status: resp.status,
      }),
    );
  }

  async createFile(username: string, fullPath: string, content = ''): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username);
    return WebdavService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethods.PUT,
        url: fullPath,
        headers: { [HTTP_HEADERS.ContentType]: RequestResponseContentType.TEXT_PLAIN },
        data: content,
      },
      FileSharingErrorMessage.CreationFailed,
      (resp: WebdavStatusResponse) => ({
        success: resp.status >= 200 && resp.status < 300,
        status: resp.status,
      }),
    );
  }

  async uploadFile(
    username: string,
    fullPath: string,
    fileStream: Readable,
    contentType: string,
  ): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username);

    return WebdavService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethods.PUT,
        url: fullPath,
        headers: {
          [HTTP_HEADERS.ContentType]: contentType,
        },
        data: fileStream,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 0,
      },
      FileSharingErrorMessage.UploadFailed,
      (response) => ({
        success: response.status === 201 || response.status === 200,
        filename: fullPath.split('/').pop() || '',
        status: response.status,
      }),
    );
  }

  async deletePath(username: string, fullPath: string): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username);
    return WebdavService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethods.DELETE,
        url: fullPath,
        headers: { [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED },
      },
      FileSharingErrorMessage.DeletionFailed,
      (resp: WebdavStatusResponse) => ({
        success: resp.status >= 200 && resp.status < 300,
        status: resp.status,
      }),
    );
  }

  async moveOrRenameResource(
    username: string,
    originFullPath: string,
    destFullPath: string,
  ): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username);
    const baseUrl = await this.webdavSharesService.getWebdavSharePath();
    const webdavShareType = await this.webdavSharesService.getWebdavShareType();
    let destinationUrl = destFullPath;
    if (webdavShareType === WEBDAV_SHARE_TYPE.EDU_FILE_PROXY) {
      destinationUrl = `${baseUrl.replace(/\/+$/, '')}/${destFullPath.replace(/^\/+/, '')}`;
    }
    return WebdavService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethodsWebDav.MOVE,
        url: decodeURI(originFullPath),
        headers: {
          Destination: decodeURI(destinationUrl),
          [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED,
        },
      },
      FileSharingErrorMessage.RenameFailed,
      (resp: WebdavStatusResponse) => ({
        success: resp.status >= 200 && resp.status < 300,
        status: resp.status,
      }),
    );
  }

  async copyFileViaWebDAV(
    username: string,
    originFullPath: string,
    destFullPath: string,
  ): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username);
    const baseUrl = await this.webdavSharesService.getWebdavSharePath();
    const webdavShareType = await this.webdavSharesService.getWebdavShareType();
    let destinationUrl = destFullPath;
    if (webdavShareType === WEBDAV_SHARE_TYPE.EDU_FILE_PROXY) {
      destinationUrl = `${baseUrl.replace(/\/+$/, '')}/${destFullPath.replace(/^\/+/, '')}`;
    }
    return WebdavService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethodsWebDav.COPY,
        url: decodeURI(originFullPath),
        headers: {
          Destination: decodeURI(destinationUrl),
          [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED,
        },
      },
      FileSharingErrorMessage.DuplicateFailed,
      (resp: WebdavStatusResponse) => ({
        success: resp.status >= 200 && resp.status < 300,
        status: resp.status,
      }),
    );
  }

  async checkIfFolderExists(username: string, parentPath: string, name: string): Promise<boolean> {
    const directories = await this.getDirectoryAtPath(username, `${parentPath}/`);
    return directories.some((item) => item.type === ContentType.DIRECTORY && item.filename === name);
  }

  async createCollectFolderIfNotExists(username: string, destinationPath: string) {
    const sanitizedDestinationPath = destinationPath.replace(`${FILE_PATHS.COLLECT}/`, '');
    const pathWithoutFilename = sanitizedDestinationPath.slice(0, sanitizedDestinationPath.lastIndexOf('/'));

    const folderAlreadyExistis = await this.checkIfFolderExists(
      username,
      `${pathWithoutFilename}/`,
      FILE_PATHS.COLLECT,
    );

    if (folderAlreadyExistis) return;

    try {
      await this.createFolder(username, pathWithoutFilename, FILE_PATHS.COLLECT);
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.CreationFailed,
        HttpStatus.NOT_FOUND,
        pathWithoutFilename,
        WebdavService.name,
      );
    }
  }

  async cutCollectedItems(
    username: string,
    originFullPath: string,
    newFullPath: string,
  ): Promise<WebdavStatusResponse> {
    await this.createCollectFolderIfNotExists(username, originFullPath);
    await this.moveOrRenameResource(username, originFullPath, newFullPath);
    return this.createFolder(username, originFullPath.replace(FILE_PATHS.COLLECT, ''), FILE_PATHS.COLLECT);
  }

  async copyCollectedItems(username: string, duplicateFile: DuplicateFileRequestDto): Promise<WebdavStatusResponse> {
    const duplicationPromises = duplicateFile.destinationFilePaths.map(async (destinationPath) => {
      await this.copyFileViaWebDAV(username, duplicateFile.originFilePath, destinationPath);
    });

    try {
      await Promise.all(duplicationPromises);
      return { success: true, status: HttpStatus.OK };
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.SharingFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFileTypeFromWebdavPath(
    username: string,
    fullPath: string,
    filepath: string,
  ): Promise<ContentType | undefined> {
    const files = await this.getFilesAtPath(username, fullPath);
    const matchedFile = files.find((file) => file.filePath === filepath);
    return matchedFile?.type === ContentType.FILE ? ContentType.FILE : ContentType.DIRECTORY;
  }
}

export default WebdavService;
