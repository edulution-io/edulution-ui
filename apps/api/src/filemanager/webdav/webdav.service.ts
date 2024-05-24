import { AxiosInstance, AxiosResponse } from 'axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { AES, enc } from 'crypto-js';
import UsersService from '../../users/users.service';
import { mapToDirectories, mapToDirectoryFiles } from './utilits';
import WebdavClientFactory from './webdav.client.factory';
import JWTUser from '../../types/JWTUser';

@Injectable()
class WebdavService {
  private client: AxiosInstance;

  private readonly webdavXML;

  private baseurl = 'https://server.schulung.multi.schule/webdav/';

  private baseWebDavAPI = 'https://server.schulung.multi.schule/api/webdav/';

  constructor(
    private webdavClientFactory: WebdavClientFactory,
    private httpService: HttpService,
    private usersService: UsersService,
  ) {
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

  private async initializeClient(token: string) {
    const decodedToken = jwt.decode(token) as JWTUser;
    if (!decodedToken || !decodedToken.preferred_username) {
      throw new Error(`Invalid token: username not found${token}`);
    }

    const username: string = decodedToken.preferred_username;
    try {
      const user = await this.usersService.findOne(username);
      const encryptedPassword = user?.password as string;
      const password = AES.decrypt(encryptedPassword, process.env.EDUI_ENCRYPTION_KEY as string).toString(enc.Utf8);
      this.client = this.webdavClientFactory.createWebdavClient(this.baseurl, username, password);
    } catch (e) {
      Logger.log(e, WebdavService.name);
      throw new HttpException('DB access failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fileExists(token: string, path: string): Promise<boolean> {
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
  }

  async getMountPoints(token: string) {
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
  }

  async getFilesAtPath(token: string, path: string) {
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
  }

  async createFolder(token: string, path: string, folderName: string) {
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
  }

  async createFile(token: string, path: string, fileName: string, content: string = '') {
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
  }

  async uploadFile(token: string, path: string, file: File, name: string) {
    await this.initializeClient(token);
    const fullPath = `${path}/${name}`;
    if (!token) return { success: false, filename: file.name };

    try {
      const response: AxiosResponse = await this.client({
        method: 'PUT',
        url: `${this.baseurl}${fullPath}`,
        headers: { 'Content-Type': file.type },
        data: file,
      });

      return response.status === 201 || response.status === 200
        ? { success: true, filename: file.name }
        : { success: false, status: response.status, filename: file.name };
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }

  async deleteFile(token: string, path: string) {
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
  }

  async renameFile(token: string, originPath: string, newPath: string) {
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
  }

  async moveItems(token: string, originPath: string, newPath: string | undefined) {
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
  }

  async getDirAtPath(token: string, path: string) {
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
  }

  async downloadFile(token: string, url: string, filename: string): Promise<string> {
    await this.initializeClient(token);
    if (!token) return '';
    const dirPath = this.ensureDownloadDir();
    const outputPath = join(dirPath, filename);

    const decodedToken = jwt.decode(token) as JWTUser;
    const username: string = decodedToken.preferred_username;

    const user = await this.usersService.findOne(username);
    const encryptedPassword = user?.password as string;
    const password = AES.decrypt(encryptedPassword, process.env.EDUI_ENCRYPTION_KEY as string).toString(enc.Utf8);

    try {
      const responseStream = await this.fetchFileStream(username, password, `${url}/${filename}`);
      await this.saveFileStream(responseStream, outputPath);
      return outputPath;
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  }

  private ensureDownloadDir(): string {
    const dirPath = join(__dirname, `tmp/downloads/${new Date().getDay()}`);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  }

  private async fetchFileStream(username: string, password: string, url: string): Promise<WriteStream> {
    const response = this.httpService.get<WriteStream>(url, {
      responseType: 'stream',
      auth: {
        username,
        password,
      },
    });
    return firstValueFrom(response).then((resp) => resp.data);
  }

  private async saveFileStream(fileStream: WriteStream, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const writer = createWriteStream(outputPath);
      fileStream.pipe(writer);
      writer.on('finish', () => resolve());
      writer.on('error', reject);
    });
  }

  async getQrCode(token: string) {
    await this.initializeClient(token);
    if (!token) return { success: false };
    try {
      const response: AxiosResponse = await this.client({
        method: 'GET',
        url: `${this.baseWebDavAPI}qrcode`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data as File;
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  }
}

export default WebdavService;
