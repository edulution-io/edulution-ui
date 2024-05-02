import { Injectable } from '@nestjs/common';
import WebDAVService from './webdav/webdav.service';

@Injectable()
class FilemanagerService {
  constructor(private webdavClientService: WebDAVService) {}

  getMountPoints = async () => this.webdavClientService.getMountPoints();

  getFilesAtPath = async (path: string) => this.webdavClientService.getFilesAtPath(path);

  createFolder = async (path: string, folderName: string) => this.webdavClientService.createFolder(path, folderName);
}

export default FilemanagerService;
