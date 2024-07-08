import { AxiosInstance, AxiosResponse } from 'axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AES, enc } from 'crypto-js';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import UsersService from '../../users/users.service';
import { mapToDirectories, mapToDirectoryFiles } from './webdav.utilits';
import WebdavClientFactory from './webdav.client.factory';
import JWTUser from '../../types/JWTUser';

interface WebdavStatusReplay {
  success: boolean;
  status?: number;
  filename?: string;
}

@Injectable()
class WebdavService {
  private client: AxiosInstance;

  private readonly webdavXML;

  private baseurl = process.env.EDUI_WEBDAV_URL as string;

  constructor(private usersService: UsersService) {
    this.webdavXML =
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
  }

  private async initializeClient(token: string): Promise<void> {
    const decodedToken = jwt.decode(token) as JWTUser;
    if (!decodedToken || !decodedToken.preferred_username) {
      throw new Error(`Invalid token: username not found${token}`);
    }

    const username: string = decodedToken.preferred_username;
    try {
      const user = await this.usersService.findOne(username);
      const encryptedPassword = user?.password as string;
      const password = AES.decrypt(encryptedPassword, process.env.EDUI_ENCRYPTION_KEY as string).toString(enc.Utf8);
      this.client = WebdavClientFactory.createWebdavClient(this.baseurl, username, password);
    } catch (e) {
      Logger.log(e, WebdavService.name);
      throw new HttpException('DB access failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  fileExists = async (token: string, path: string): Promise<boolean> => {
    try {
      const parts = path.split('/');
      const fileName = parts.pop() || 'undefined';
      const newPath = parts.join('/');
      const resp = await this.getFilesAtPath(token, newPath);
      const fileExists = resp.find((file) => file.filename.includes(fileName));
      return Boolean(fileExists);
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  };

  getMountPoints = async (token: string): Promise<DirectoryFile[] | { success: boolean }> => {
    await this.initializeClient(token);

    const data = this.webdavXML;
    if (!token) return { success: false };
    try {
      const response: AxiosResponse<string> = await this.client({
        method: 'PROPFIND',
        data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return mapToDirectoryFiles(response.data);
    } catch (error) {
      console.error('Failed to execute PROPFIND request:', error);
      throw error;
    }
  };

  getFilesAtPath = async (token: string, path: string): Promise<DirectoryFile[]> => {
    await this.initializeClient(token);
    const pathWithoutWebdav = path.replace('/webdav', '');
    const data = this.webdavXML;
    if (!token) return [];
    try {
      const response: AxiosResponse<string> = await this.client({
        method: 'PROPFIND',
        url: this.baseurl + pathWithoutWebdav,
        data,
      });

      return mapToDirectoryFiles(response.data);
    } catch (error) {
      console.error('Failed to execute PROPFIND request:', error);
      throw error;
    }
  };

  createFolder = async (token: string, path: string, folderName: string): Promise<WebdavStatusReplay> => {
    await this.initializeClient(token);
    if (!token) return { success: false };
    try {
      const response: AxiosResponse = await this.client({
        method: 'MKCOL',
        url: `${this.baseurl}${path}/${folderName}`,
      });
      return response.status >= 200 && response.status < 300
        ? { success: true }
        : { success: false, status: response.status };
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  };

  createFile = async (
    token: string,
    path: string,
    fileName: string,
    content: string = '',
  ): Promise<WebdavStatusReplay> => {
    await this.initializeClient(token);
    const fullPath = `${path.replace('/webdav/', '')}/${fileName}`;
    if (!token) return { success: false };
    try {
      const response: AxiosResponse = await this.client({
        method: 'PUT',
        url: `${this.baseurl}${fullPath}`,
        headers: { 'Content-Type': 'text/plain' },
        data: content,
      });
      return response.status >= 200 && response.status < 300
        ? { success: true }
        : { success: false, status: response.status };
    } catch (error) {
      console.error('Failed to create file:', error);
      throw error;
    }
  };

  uploadFile = async (
    token: string,
    path: string,
    file: Express.Multer.File,
    name: string,
  ): Promise<WebdavStatusReplay> => {
    await this.initializeClient(token);
    const fullPath = `${path}/${name}`;
    if (!token) return { success: false, filename: file.originalname };

    try {
      const response: AxiosResponse = await this.client.put(fullPath, file.buffer, {
        headers: {
          'Content-Type': file.mimetype,
        },
      });

      return response.status === 201 || response.status === 200
        ? { success: true, filename: file.originalname }
        : { success: false, status: response.status, filename: file.originalname };
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  };

  deleteFile = async (token: string, path: string): Promise<WebdavStatusReplay> => {
    await this.initializeClient(token);
    if (!token) return { success: false };
    try {
      const response: AxiosResponse = await this.client({
        method: 'DELETE',
        url: `${this.baseurl}${path}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.status >= 200 && response.status < 300
        ? { success: true }
        : { success: false, status: response.status };
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  };

  renameFile = async (token: string, originPath: string, newPath: string): Promise<WebdavStatusReplay> => {
    await this.initializeClient(token);
    if (!token) return { success: false };
    try {
      const response: AxiosResponse = await this.client({
        method: 'MOVE',
        url: `${this.baseurl}${originPath}`,
        headers: {
          Destination: `${this.baseurl}${newPath}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.status >= 200 && response.status < 300
        ? { success: true }
        : { success: false, status: response.status };
    } catch (error) {
      console.error('Failed to rename file:', error);
      throw error;
    }
  };

  moveItems = async (token: string, originPath: string, newPath: string | undefined): Promise<WebdavStatusReplay> => {
    await this.initializeClient(token);
    if (!token) return { success: false };
    try {
      const response: AxiosResponse = await this.client({
        method: 'MOVE',
        url: `${this.baseurl}${originPath}`,
        headers: {
          Destination: `${this.baseurl}${newPath}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.status >= 200 && response.status < 300
        ? { success: true }
        : { success: false, status: response.status };
    } catch (error) {
      console.error('Failed to move items:', error);
      throw error;
    }
  };

  getDirAtPath = async (token: string, path: string): Promise<DirectoryFile[]> => {
    await this.initializeClient(token);
    const pathWithoutWebdav = path.replace('/webdav', '');
    const data = this.webdavXML;
    if (!token) return [];
    try {
      const response: AxiosResponse<string> = await this.client({
        method: 'PROPFIND',
        url: this.baseurl + pathWithoutWebdav,
        data,
      });

      return mapToDirectories(response.data);
    } catch (error) {
      console.error('Failed to execute PROPFIND request:', error);
      throw error;
    }
  };
}

export default WebdavService;
