import { HttpStatus, Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosResponse } from 'axios';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import CustomHttpException from '@libs/error/CustomHttpException';
import FileSharingErrorMessage from '@libs/filesharing/fileSharingErrorMessage';
import ErrorMessage from '@libs/error/errorMessage';
import {
  HttpMethodes,
  HttpMethodesWebDav,
  RequestResponseContentType,
  ResponseType,
} from '@libs/common/types/http-methods';
import * as crypto from 'crypto';
import * as pathLib from 'path';
import { existsSync, mkdirSync } from 'fs';
import { firstValueFrom } from 'rxjs';
import { Readable } from 'stream';
import { WebdavStatusReplay } from '@libs/filesharing/FileOperationResult';
import HashAlgorithm from '@libs/algorithm/hashAlgorithm';
import { HttpService } from '@nestjs/axios';
import WebdavClientFactory from './webdav.client.factory';
import { mapToDirectories, mapToDirectoryFiles } from './filesharing.utilities';
import EduApiUtility from '../utilits/eduApiUtility';
import UsersService from '../users/users.service';

@Injectable()
class FilesharingService {
  private clientCache = new Map<string, { client: AxiosInstance; timeout: NodeJS.Timeout }>();

  private readonly baseurl: string;

  private downloadLinkLocation: string;

  private readonly eduApiUtilits: EduApiUtility;

  private readonly eduEncrytionKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UsersService,
  ) {
    this.baseurl = process.env.EDUI_WEBDAV_URL as string;
    this.eduEncrytionKey = process.env.EDUI_ENCRYPTION_KEY as string;
    this.eduApiUtilits = new EduApiUtility(this.userService, this.eduEncrytionKey);
  }

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
    const user = await this.eduApiUtilits.ensureValidUser(username);
    const password = EduApiUtility.decryptPassword(user?.password as string, this.eduEncrytionKey);

    const client = WebdavClientFactory.createWebdavClient(this.baseurl, username, password);
    const timeout = this.setCacheTimeout(username);
    this.clientCache.set(username, { client, timeout });
  }

  private async fetchFileStream(
    username: string,
    url: string,
    streamFetching = false,
  ): Promise<AxiosResponse<Readable> | Readable> {
    try {
      const password = await this.eduApiUtilits.getPasswordForUser(username);
      const authContents = `${username}:${password}`;
      const protocol = url.startsWith('https') ? 'https' : 'http';
      const authenticatedUrl = url.replace(/^https?:\/\//, `${protocol}://${authContents}@`);

      const response = this.httpService.get<Readable>(authenticatedUrl, {
        responseType: ResponseType.STREAM,
      });

      return await firstValueFrom(response).then((res) => (streamFetching ? res : res.data));
    } catch (error) {
      throw new Error(`Failed to fetch file stream from ${url}: ${error}`);
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

  private static async executeWebdavRequest<T>(
    client: AxiosInstance,
    config: { method: string; url?: string; data?: any; headers?: any },
    fileSharingErrorMessage: ErrorMessage,
    transformer?: (data: any) => T,
  ): Promise<T | WebdavStatusReplay> {
    try {
      const response = await client(config);
      FilesharingService.handleWebDAVError(response);

      return transformer ? transformer(response.data) : (response.data as T);
    } catch (error) {
      throw new CustomHttpException(fileSharingErrorMessage, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  // Generate the WebDAV XML for requests
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

  getMountPoints = async (username: string): Promise<DirectoryFile[]> => {
    const client = await this.getClient(username);
    return (await FilesharingService.executeWebdavRequest<DirectoryFile[]>(
      client,
      {
        method: HttpMethodesWebDav.PROPFIND,
        data: this.webdavXML,
        headers: { 'Content-Type': RequestResponseContentType.APPLICATION_XML },
      },
      FileSharingErrorMessage.MountPointsNotFound,
    )) as DirectoryFile[];
  };

  getFilesAtPath = async (username: string, path: string): Promise<DirectoryFile[]> => {
    const client = await this.getClient(username);

    return (await FilesharingService.executeWebdavRequest<DirectoryFile[]>(
      client,
      {
        method: HttpMethodesWebDav.PROPFIND,
        url: this.baseurl + EduApiUtility.getPathWithoutWebdav(path),
        data: this.webdavXML,
      },
      FileSharingErrorMessage.FileNotFound,
      mapToDirectoryFiles,
    )) as DirectoryFile[];
  };

  getDirAtPath = async (username: string, path: string): Promise<DirectoryFile[]> => {
    const client = await this.getClient(username);
    return (await FilesharingService.executeWebdavRequest<DirectoryFile[]>(
      client,
      {
        method: HttpMethodesWebDav.PROPFIND,
        url: this.baseurl + EduApiUtility.getPathWithoutWebdav(path),
        data: this.webdavXML,
        headers: { 'Content-Type': RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED },
      },
      FileSharingErrorMessage.FolderNotFound,
      mapToDirectories,
    )) as DirectoryFile[];
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
    const fullPath = `${this.baseurl}${EduApiUtility.getPathWithoutWebdav(path)}/${fileName}`;

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

  uploadFile = async (
    username: string,
    path: string,
    file: Express.Multer.File,
    name: string,
  ): Promise<WebdavStatusReplay> => {
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

  renameFile = async (username: string, originPath: string, newPath: string): Promise<WebdavStatusReplay> => {
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

  moveItems = async (
    username: string,
    originPath: string,
    newPath: string | undefined,
  ): Promise<WebdavStatusReplay> => {
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
          'Content-Type': RequestResponseContentType.APPLICATION_JSON,
        },
      },

      FileSharingErrorMessage.MoveFailed,
      (response: WebdavStatusReplay) =>
        ({
          success: response.status >= 200 && response.status < 300,
          status: response.status,
        }) as WebdavStatusReplay,
    );
  };

  async downloadLink(username: string, filePath: string, filename: string): Promise<WebdavStatusReplay> {
    const outputFolder = pathLib.resolve(__dirname, '..', 'public', 'downloads');
    const url = `${this.baseurl}${EduApiUtility.getPathWithoutWebdav(filePath)}`;
    if (!existsSync(outputFolder)) {
      mkdirSync(outputFolder, { recursive: true });
    }

    try {
      const responseStream = await this.fetchFileStream(username, `${url}`);
      const hash = crypto.createHash(HashAlgorithm).update(filePath).digest('hex');
      const extension = pathLib.extname(filename);
      const hashedFilename = `${hash}${extension}`;
      const outputFilePath = pathLib.join(outputFolder, hashedFilename);

      await EduApiUtility.saveFileStream(responseStream, outputFilePath);

      const publicUrl = `${this.downloadLinkLocation}${hashedFilename}`;

      return {
        success: true,
        status: HttpStatus.OK,
        data: publicUrl,
      } as WebdavStatusReplay;
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.DownloadFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async getWebDavFileStream(username: string, filePath: string): Promise<Readable> {
    const url = `${this.baseurl}${EduApiUtility.getPathWithoutWebdav(filePath)}`;
    const resp = await this.fetchFileStream(username, url);
    if (resp instanceof Readable) {
      return resp;
    }
    return resp.data;
  }
}

export default FilesharingService;
