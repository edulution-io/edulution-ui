import { AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';
import WebdavClientFactory from './webdav.client.factory';
import mapToDirectoryFiles from './utilits';

@Injectable()
class WebdavService {
  private readonly client;

  private readonly webdavXML;

  private baseurl = 'https://server.schulung.multi.schule/webdav/';

  private baseWebDavAPI = 'https://server.schulung.multi.schule/api/webdav/';

  constructor(private webdavClientFactory: WebdavClientFactory) {
    this.client = this.webdavClientFactory.createWebdavClient(this.baseurl, 'netzint-teacher', 'Muster!');
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

  async getMountPoints() {
    const data = this.webdavXML;
    try {
      const response: AxiosResponse<string> = await this.client({
        method: 'PROPFIND',
        data,
      });
      return mapToDirectoryFiles(response.data);
    } catch (error) {
      console.error('Failed to execute PROPFIND request:', error);
      throw error;
    }
  }

  async getFilesAtPath(path: string) {
    const pathWithoutWebdav = path.replace('/webdav', '');
    const data = this.webdavXML;
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

  async createFolder(path: string, folderName: string) {
    try {
      const response: AxiosResponse = await this.client({
        method: 'MKCOL',
        url: `${this.baseurl}${path}/${folderName}`,
      });
      return response.status === 201 ? { success: true } : { success: false, status: response.status };
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  }

  async createFile(path: string, fileName: string, content: string = '') {
    try {
      const response: AxiosResponse = await this.client({
        method: 'PUT',
        url: `${this.baseurl}${path}/${fileName}`,
        headers: { 'Content-Type': 'text/plain' },
        data: content,
      });
      return response.status === 201 || response.status === 200
        ? { success: true }
        : { success: false, status: response.status };
    } catch (error) {
      console.error('Failed to create file:', error);
      throw error;
    }
  }

  async uploadFile(path: string, file: File, name: string) {
    try {
      console.log('file:', file);
      const response: AxiosResponse = await this.client({
        method: 'PUT',
        url: `${this.baseurl}${path}/${name}`,
        headers: { 'Content-Type': file.type },
        data: file,
      });
      return response.status === 201 || response.status === 200
        ? { success: true }
        : { success: false, status: response.status };
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }

  async deleteFile(path: string) {
    try {
      const response: AxiosResponse = await this.client({
        method: 'DELETE',
        url: `${this.baseurl}${path}`,
      });
      return response.status === 204 ? { success: true } : { success: false, status: response.status };
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  async renameFile(path: string, newName: string) {
    try {
      const response: AxiosResponse = await this.client({
        method: 'MOVE',
        url: `${this.baseurl}${path}`,
        headers: { Destination: `${this.baseurl}${newName}` },
      });
      return response.status === 201 || response.status === 204
        ? { success: true }
        : { success: false, status: response.status };
    } catch (error) {
      console.error('Failed to rename file:', error);
      throw error;
    }
  }

  async moveItems(originPath: string, newPath: string | undefined) {
    try {
      const response: AxiosResponse = await this.client({
        method: 'MOVE',
        url: `${this.baseurl}${originPath}`,
        headers: { Destination: `${this.baseurl}${newPath}` },
      });
      return response.status === 201 || response.status === 204
        ? { success: true }
        : { success: false, status: response.status };
    } catch (error) {
      console.error('Failed to move items:', error);
      throw error;
    }
  }

  async getFileDownloadLink(path: string) {
    try {
      const response: AxiosResponse = await this.client({
        method: 'GET',
        url: `${this.baseurl}${path}`,
      });
      return response.data as File;
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  }

  async getQrCode() {
    try {
      const response: AxiosResponse = await this.client({
        method: 'GET',
        url: `${this.baseWebDavAPI}qrcode`,
      });
      return response.data as File;
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  }
}

export default WebdavService;
