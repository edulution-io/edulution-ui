import { AxiosResponse } from 'axios';
import { Delete, Injectable } from '@nestjs/common';
import WebdavClientFactory from './webdav.client.factory';
import mapToDirectoryFiles from './utilits';

@Injectable()
class WebdavService {
  private readonly client;

  private readonly webdavXML;

  private baseurl = 'https://server.schulung.multi.schule/webdav/';

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

  @Delete('delete/*')
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
}

export default WebdavService;
