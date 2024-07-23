import { HttpStatus, Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosResponse } from 'axios';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import CustomHttpException from '@libs/error/CustomHttpException';
import FileSharingErrorMessage from '@libs/filesharing/fileSharingErrorMessage';
import ErrorMessage from '@libs/error/errorMessage';
import { HttpMethodes, HttpMethodesWebDav } from '@libs/common/types/http-methods';
import { getDecryptedPassword } from '@libs/common/utils';
import UsersService from '../users/users.service';
import WebdavClientFactory from './webdav.client.factory';
import { mapToDirectories, mapToDirectoryFiles } from './filesharing.utilities';
import { WebdavStatusReplay } from './filesharing.types';
import { User } from '../users/user.schema';

@Injectable()
class FilesharingService {
  private clientCache = new Map<string, { client: AxiosInstance; timeout: NodeJS.Timeout }>();

  private readonly baseurl: string;

  private readonly eduEncrytionKey: string;

  constructor(private usersService: UsersService) {
    this.baseurl = process.env.EDUI_WEBDAV_URL as string;
    this.eduEncrytionKey = process.env.EDUI_ENCRYPTION_KEY as string;
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

  private static getPathWithoutWebdav(path: string): string {
    return path.replace('/webdav', '');
  }

  private async ensureValidUser(username: string): Promise<User> {
    const user = await this.usersService.findOne(username);
    if (!user || !user.password) {
      throw new CustomHttpException(FileSharingErrorMessage.DbAccessFailed, HttpStatus.NOT_FOUND, {
        message: 'User not found or password missing',
      });
    }
    return user;
  }

  private async initializeClient(username: string): Promise<void> {
    const user = await this.ensureValidUser(username);
    const password = getDecryptedPassword(user?.password as string, this.eduEncrytionKey);

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
    config: { method: string; url?: string; data?: any; headers?: any },
    fileSharingErrorMessage: ErrorMessage,
    transformer?: (data: any) => T,
  ): Promise<T | WebdavStatusReplay> {
    try {
      const response = await client(config);
      FilesharingService.handleWebDAVError(response); // Ensuring only successful responses proceed

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
        headers: { 'Content-Type': 'application/xml' },
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
        url: this.baseurl + FilesharingService.getPathWithoutWebdav(path),
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
        url: this.baseurl + FilesharingService.getPathWithoutWebdav(path),
        data: this.webdavXML,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
    const fullPath = `${this.baseurl}${FilesharingService.getPathWithoutWebdav(path)}/${fileName}`;

    return FilesharingService.executeWebdavRequest<WebdavStatusReplay>(
      client,
      {
        method: HttpMethodes.PUT,
        url: fullPath,
        headers: { 'Content-Type': 'text/plain' },
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
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
          'Content-Type': 'application/x-www-form-urlencoded',
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
          'Content-Type': 'Content-Type: application/json',
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
}

export default FilesharingService;
