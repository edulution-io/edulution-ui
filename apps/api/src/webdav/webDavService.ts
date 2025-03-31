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

import { HttpStatus } from '@nestjs/common';
import { AxiosInstance, AxiosResponse } from 'axios';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import CustomHttpException from '@libs/error/CustomHttpException';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import { WebdavStatusResponse } from '@libs/filesharing/types/fileOperationResult';
import { HttpMethods, HttpMethodsWebDav, RequestResponseContentType } from '@libs/common/types/http-methods';
import CustomFile from '@libs/filesharing/types/customFile';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import ContentType from '@libs/filesharing/types/contentType';
import FILE_PATHS from '@libs/filesharing/constants/file-paths';
import ErrorMessage from '@libs/error/errorMessage';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import { mapToDirectories, mapToDirectoryFiles } from '../filesharing/filesharing.utilities';

import WebdavClientFactory from '../filesharing/webdav.client.factory';
import UsersService from '../users/users.service';

class WebDavService {
  private static readonly baseUrl = process.env.EDUI_WEBDAV_URL as string;

  private static userService: UsersService;

  private static clientCache = new Map<string, { client: AxiosInstance; timeout: NodeJS.Timeout }>();

  public static configure(userService: UsersService) {
    this.userService = userService;
  }

  private static setCacheTimeout(token: string): NodeJS.Timeout {
    return setTimeout(
      () => {
        this.clientCache.delete(token);
      },
      30 * 60 * 1000,
    );
  }

  private static async initializeClient(username: string): Promise<void> {
    if (!this.userService) {
      throw new Error('WebDavService: userService not configured. Call WebDavService.configure(...) first!');
    }
    const password = await this.userService.getPassword(username);
    const client = WebdavClientFactory.createWebdavClient(this.baseUrl, username, password);
    const timeout = this.setCacheTimeout(username);
    this.clientCache.set(username, { client, timeout });
  }

  public static async getClient(username: string): Promise<AxiosInstance> {
    if (!this.clientCache.has(username)) {
      await this.initializeClient(username);
    } else {
      // Reset the expiration timer on the cached client
      clearTimeout(this.clientCache.get(username)!.timeout);
      this.clientCache.get(username)!.timeout = this.setCacheTimeout(username);
    }
    const client = this.clientCache.get(username)?.client;
    if (!client) {
      throw new Error(`Failed to initialize WebDAV client for user: ${username}`);
    }
    return client;
  }

  public static async executeWebdavRequest<T>(
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
      this.handleWebDAVError(response);
      return transformer ? transformer(response.data) : (response.data as T);
    } catch (error) {
      if (showDebugMessage) {
        throw new CustomHttpException(fileSharingErrorMessage, HttpStatus.NOT_FOUND, error, WebDavService.name);
      }
      throw new CustomHttpException(fileSharingErrorMessage, HttpStatus.INTERNAL_SERVER_ERROR, '', WebDavService.name);
    }
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

  static getPathUntilFolder(fullPath: string, folderName: string): string {
    const segments = fullPath.split('/');
    const index = segments.indexOf(folderName);

    if (index === -1) {
      return fullPath;
    }
    const partialSegments = segments.slice(0, index + 1);
    return partialSegments.join('/');
  }

  static async ensureFolderExists(username: string, basePath: string, folderName: string) {
    const exists = await this.checkIfFolderExists(username, basePath, folderName);
    if (!exists) {
      await this.createFolder(username, basePath, folderName);
    }
  }

  public static async getFilesAtPath(username: string, path: string): Promise<DirectoryFileDTO[]> {
    const client = await this.getClient(username);
    const url = this.baseUrl + getPathWithoutWebdav(path);

    return (await this.executeWebdavRequest<DirectoryFileDTO[]>(
      client,
      {
        method: HttpMethodsWebDav.PROPFIND,
        url,
        data: this.defaultPropfindXml,
      },
      FileSharingErrorMessage.FileNotFound,
      mapToDirectoryFiles,
    )) as DirectoryFileDTO[];
  }

  public static async getDirAtPath(username: string, path: string): Promise<DirectoryFileDTO[]> {
    const client = await this.getClient(username);
    const url = this.baseUrl + getPathWithoutWebdav(path);

    return (await this.executeWebdavRequest<DirectoryFileDTO[]>(
      client,
      {
        method: HttpMethodsWebDav.PROPFIND,
        url,
        data: this.defaultPropfindXml,
        headers: { 'Content-Type': RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED },
      },
      FileSharingErrorMessage.FolderNotFound,
      mapToDirectories,
    )) as DirectoryFileDTO[];
  }

  public static readonly defaultPropfindXml = `<?xml version="1.0"?>
      <d:propfind xmlns:d="DAV:">
        <d:prop>
          <d:getlastmodified/>
          <d:getetag/>
          <d:getcontenttype/>
          <d:getcontentlength/>
          <d:displayname/>
          <d:creationdate/>
        </d:prop>
      </d:propfind>
  `;

  public static async createFolder(username: string, path: string, folderName: string): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username);
    const fullPath = `${this.baseUrl}${path}/${folderName}`;

    return this.executeWebdavRequest<WebdavStatusResponse>(
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

  public static async createFile(username: string, fullPath: string, content = ''): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username);
    return this.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethods.PUT,
        url: fullPath,
        headers: { 'Content-Type': RequestResponseContentType.TEXT_PLAIN },
        data: content,
      },
      FileSharingErrorMessage.CreationFailed,
      (resp: WebdavStatusResponse) => ({
        success: resp.status >= 200 && resp.status < 300,
        status: resp.status,
      }),
    );
  }

  public static async uploadFile(username: string, fullPath: string, file: CustomFile): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username);
    return this.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethods.PUT,
        url: fullPath,
        headers: { 'Content-Type': file.mimetype },
        data: file.buffer,
      },
      FileSharingErrorMessage.UploadFailed,
      (resp: WebdavStatusResponse) => ({
        success: resp.status === 201 || resp.status === 200,
        filename: file.originalname,
        status: resp.status,
      }),
    );
  }

  public static async deletePath(username: string, fullPath: string): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username);
    return this.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethods.DELETE,
        url: fullPath,
        headers: { 'Content-Type': RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED },
      },
      FileSharingErrorMessage.DeletionFailed,
      (resp: WebdavStatusResponse) => ({
        success: resp.status >= 200 && resp.status < 300,
        status: resp.status,
      }),
    );
  }

  public static async moveOrRenameResource(
    username: string,
    originFullPath: string,
    destFullPath: string,
  ): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username);
    return this.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethodsWebDav.MOVE,
        url: originFullPath,
        headers: {
          Destination: destFullPath,
          'Content-Type': RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED,
        },
      },
      FileSharingErrorMessage.RenameFailed,
      (resp: WebdavStatusResponse) => ({
        success: resp.status >= 200 && resp.status < 300,
        status: resp.status,
      }),
    );
  }

  public static async copyFileViaWebDAV(
    username: string,
    originFullPath: string,
    destFullPath: string,
  ): Promise<WebdavStatusResponse> {
    const client = await this.getClient(username);
    return this.executeWebdavRequest<WebdavStatusResponse>(
      client,
      {
        method: HttpMethodsWebDav.COPY,
        url: originFullPath,
        headers: { Destination: destFullPath },
      },
      FileSharingErrorMessage.DuplicateFailed,
      (resp: WebdavStatusResponse) => ({
        success: resp.status >= 200 && resp.status < 300,
        status: resp.status,
      }),
    );
  }

  static async checkIfFolderExists(username: string, parentPath: string, name: string): Promise<boolean> {
    const directories = await this.getDirAtPath(username, `${parentPath}/`);
    return directories.some((item) => item.type === ContentType.DIRECTORY && item.basename === name);
  }

  public static getStudentNameFromPath(filePath: string): string | null {
    const parts = filePath.split('/');
    if (parts.length < 3) {
      return null;
    }
    return parts[2];
  }

  public static async createCollectFolderIfNotExists(username: string, destinationPath: string) {
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
        WebDavService.name,
      );
    }
  }

  public static async cutCollectedItems(
    username: string,
    originFullPath: string,
    newFullPath: string,
  ): Promise<WebdavStatusResponse> {
    await WebDavService.createCollectFolderIfNotExists(username, originFullPath);
    await WebDavService.moveOrRenameResource(username, originFullPath, newFullPath);
    return WebDavService.createFolder(username, originFullPath, FILE_PATHS.COLLECT);
  }

  public static async copyCollectedItems(
    username: string,
    duplicateFile: DuplicateFileRequestDto,
  ): Promise<WebdavStatusResponse> {
    const duplicationPromises = duplicateFile.destinationFilePaths.map(async (destinationPath) => {
      await WebDavService.copyFileViaWebDAV(username, duplicateFile.originFilePath, destinationPath);
    });

    try {
      await Promise.all(duplicationPromises);
      return { success: true, status: HttpStatus.OK };
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.SharingFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export default WebDavService;
