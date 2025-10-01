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
import got from 'got';
import { Agent as HttpsAgent } from 'https';
import { Agent as HttpAgent } from 'http';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
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

  async initializeClient(username: string, share: string): Promise<void> {
    const password = await this.usersService.getPassword(username);
    const baseUrl = await this.webdavSharesService.getWebdavSharePath(share);
    const client = WebdavClientFactory.createWebdavClient(baseUrl, username, password);
    const timeout = this.scheduleClientTimeout(username);
    this.webdavClientCache.set(username, { client, timeout });
  }

  public async getClient(username: string, share: string): Promise<AxiosInstance> {
    if (!this.webdavClientCache.has(username)) {
      await this.initializeClient(username, share);
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

  async ensureFolderExists(username: string, basePath: string, folderName: string, share: string) {
    const exists = await this.checkIfFolderExists(username, basePath, folderName, share);
    if (!exists) {
      await this.createFolder(username, basePath, folderName, share);
    }
  }

  static safeJoinUrl(base: string, path: string) {
    try {
      const cleanedPath = (path || '').replace(/^\/+/, '').replace(/\/+$/, '');

      const finalPath = cleanedPath ? `${cleanedPath}/` : '';

      return new URL(finalPath, base).href;
    } catch (err) {
      Logger.error(`Invalid URL input (base="${base}", path="${path}")`, WebdavService.name);
      return base;
    }
  }

  async getFilesAtPath(username: string, path: string, share: string): Promise<DirectoryFileDTO[]> {
    const client = await this.getClient(username, share);
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);
    const pathWithoutWebdav = getPathWithoutWebdav(path, webdavShare.pathname);
    const url = WebdavService.safeJoinUrl(webdavShare.url, pathWithoutWebdav);

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

  async getDirectoryAtPath(username: string, path: string, share: string): Promise<DirectoryFileDTO[]> {
    const client = await this.getClient(username, share);
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);
    const pathWithoutWebdav = getPathWithoutWebdav(path, webdavShare.pathname);
    const url = WebdavService.safeJoinUrl(webdavShare.url, pathWithoutWebdav);

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

  async createFolder(username: string, path: string, folderName: string, share: string): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username, share);
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);
    const basePath = getPathWithoutWebdav(path, webdavShare.pathname);
    const encodedPath = WebdavService.safeJoinUrl(webdavShare.url, basePath);
    const encodedFolder = encodeURIComponent(folderName.trim());

    const fullUrl = `${encodedPath}${encodedFolder}`;

    return WebdavService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethodsWebDav.MKCOL,
        url: fullUrl,
      },
      FileSharingErrorMessage.FolderCreationFailed,
      (resp: WebdavStatusResponse) => ({
        success: resp?.status >= 200 && resp?.status < 300,
        status: resp.status,
      }),
    );
  }

  async uploadFile(
    username: string,
    fullPath: string,
    fileStream: Readable,
    share: string,
    contentType: string,
    totalSize?: number,
    onProgress?: (transferred: number, total?: number) => void,
  ): Promise<WebdavStatusResponse> {
    const password = await this.usersService.getPassword(username);
    const baseUrl = await this.webdavSharesService.getWebdavSharePath(share);
    const url = WebdavService.safeJoinUrl(baseUrl, fullPath);

    const headers: Record<string, string> = { [HTTP_HEADERS.ContentType]: contentType };
    if (totalSize && Number.isFinite(totalSize) && totalSize > 0) {
      headers[HTTP_HEADERS.ContentLength] = String(totalSize);
    }

    try {
      const request = got.put(url, {
        agent: {
          http: new HttpAgent({ keepAlive: true }),
          https: new HttpsAgent({ keepAlive: true, rejectUnauthorized: false }),
        },
        body: fileStream,
        headers,
        username,
        password,
        http2: false,
        retry: { limit: 0 },
        throwHttpErrors: true,
        decompress: false,
      });
      fileStream.on('aborted', () => request.cancel());
      fileStream.on('error', () => request.cancel());

      void request.on('uploadProgress', (p) => onProgress?.(p.transferred, p.total));

      const response = await request;
      const ok = response.statusCode >= 200 && response.statusCode < 300;
      return { success: ok, status: response.statusCode, filename: fullPath.split('/').pop() || '' };
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_CREATION_FAILED, HttpStatus.FORBIDDEN, WebdavService.name);
    }
  }

  async deletePath(username: string, fullPath: string, share: string): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username, share);
    return WebdavService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethods.DELETE,
        url: encodeURI(fullPath),
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
    share: string,
  ): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username, share);
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);
    let destinationUrl = destFullPath;
    if (webdavShare.type === WEBDAV_SHARE_TYPE.EDU_FILE_PROXY) {
      destinationUrl = `${webdavShare.url.replace(/\/+$/, '')}/${destFullPath.replace(/^\/+/, '')}`;
    }
    return WebdavService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethodsWebDav.MOVE,
        url: encodeURI(originFullPath),
        headers: {
          Destination: encodeURI(destinationUrl),
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
    share: string,
  ): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username, share);
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);
    let destinationUrl = destFullPath;
    if (webdavShare.type === WEBDAV_SHARE_TYPE.EDU_FILE_PROXY) {
      destinationUrl = `${webdavShare.url.replace(/\/+$/, '')}/${destFullPath.replace(/^\/+/, '')}`;
    }
    return WebdavService.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethodsWebDav.COPY,
        url: encodeURI(originFullPath),
        headers: {
          Destination: encodeURI(destinationUrl),
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

  async checkIfFolderExists(username: string, parentPath: string, name: string, share: string): Promise<boolean> {
    const directories = await this.getDirectoryAtPath(username, `${parentPath}/`, share);
    return directories.some((item) => item.type === ContentType.DIRECTORY && item.filename === name);
  }

  async createCollectFolderIfNotExists(username: string, destinationPath: string, share: string) {
    const sanitizedDestinationPath = destinationPath.replace(`${FILE_PATHS.COLLECT}/`, '');
    const pathWithoutFilename = sanitizedDestinationPath.slice(0, sanitizedDestinationPath.lastIndexOf('/'));

    const folderAlreadyExistis = await this.checkIfFolderExists(
      username,
      `${pathWithoutFilename}/`,
      FILE_PATHS.COLLECT,
      share,
    );

    if (folderAlreadyExistis) return;

    try {
      await this.createFolder(username, pathWithoutFilename, FILE_PATHS.COLLECT, share);
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
    share: string,
  ): Promise<WebdavStatusResponse> {
    await this.createCollectFolderIfNotExists(username, originFullPath, share);
    await this.moveOrRenameResource(username, originFullPath, newFullPath, share);
    return this.createFolder(username, originFullPath.replace(FILE_PATHS.COLLECT, ''), FILE_PATHS.COLLECT, share);
  }

  async copyCollectedItems(
    username: string,
    duplicateFile: DuplicateFileRequestDto,
    share: string,
  ): Promise<WebdavStatusResponse> {
    const duplicationPromises = duplicateFile.destinationFilePaths.map(async (destinationPath) => {
      await this.copyFileViaWebDAV(username, duplicateFile.originFilePath, destinationPath, share);
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
    share: string,
  ): Promise<ContentType | undefined> {
    const files = await this.getFilesAtPath(username, fullPath, share);
    const matchedFile = files.find((file) => file.filePath === filepath);
    return matchedFile?.type === ContentType.FILE ? ContentType.FILE : ContentType.DIRECTORY;
  }
}

export default WebdavService;
