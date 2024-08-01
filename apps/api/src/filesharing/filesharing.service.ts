import { HttpStatus, Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosResponse } from 'axios';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import CustomHttpException from '@libs/error/CustomHttpException';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import ErrorMessage from '@libs/error/errorMessage';
import {
  HttpMethodes,
  HttpMethodesWebDav,
  RequestResponseContentType,
  ResponseType,
} from '@libs/common/types/http-methods';
import { firstValueFrom } from 'rxjs';
import { Readable } from 'stream';
import { WebdavStatusReplay } from '@libs/filesharing/types/fileOperationResult';
import { HttpService } from '@nestjs/axios';
import CustomFile from '@libs/filesharing/types/customFile';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import getProtocol from '@libs/common/utils/getProtocol';
import UsersService from '../users/users.service';
import WebdavClientFactory from './webdav.client.factory';
import { mapToDirectories, mapToDirectoryFiles } from './filesharing.utilities';

@Injectable()
class FilesharingService {
  private clientCache = new Map<string, { client: AxiosInstance; timeout: NodeJS.Timeout }>();

  private readonly baseurl = process.env.EDUI_WEBDAV_URL as string;

  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UsersService,
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
  ): Promise<T | WebdavStatusReplay> {
    try {
      const response = await client(config);
      FilesharingService.handleWebDAVError(response);

      return transformer ? transformer(response.data) : (response.data as T);
    } catch (error) {
      throw new CustomHttpException(fileSharingErrorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
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

  private async fetchFileStream(
    username: string,
    url: string,
    streamFetching = false,
  ): Promise<AxiosResponse<Readable> | Readable> {
    try {
      const password = await this.userService.getPassword(username);
      const authContents = `${username}:${password}`;
      const protocol = getProtocol(url);
      const authenticatedUrl = url.replace(/^https?:\/\//, `${protocol}://${authContents}@`);

      const fileStream = this.httpService.get<Readable>(authenticatedUrl, {
        responseType: ResponseType.STREAM,
      });

      return await firstValueFrom(fileStream).then((res) => (streamFetching ? res : res.data));
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.DownloadFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  getFilesAtPath = async (username: string, path: string): Promise<DirectoryFileDTO[]> => {
    const client = await this.getClient(username);

    return (await FilesharingService.executeWebdavRequest<DirectoryFileDTO[]>(
      client,
      {
        method: HttpMethodesWebDav.PROPFIND,
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
        method: HttpMethodesWebDav.PROPFIND,
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

    return FilesharingService.executeWebdavRequest<WebdavStatusReplay>(
      client,
      {
        method: HttpMethodesWebDav.MKCOL,
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
        method: HttpMethodes.PUT,
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
        method: HttpMethodes.PUT,
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
        method: HttpMethodes.DELETE,
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
        method: HttpMethodesWebDav.MOVE,
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

  async getWebDavFileStream(username: string, filePath: string): Promise<Readable> {
    try {
      const url = `${this.baseurl}${getPathWithoutWebdav(filePath)}`;
      const resp = await this.fetchFileStream(username, url);
      if (resp instanceof Readable) {
        return resp;
      }
      return resp.data;
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.DownloadFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }
}

export default FilesharingService;
