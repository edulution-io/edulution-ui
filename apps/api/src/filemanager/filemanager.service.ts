import { Injectable } from '@nestjs/common';
import WebDAVService from './webdav/webdav.service';

@Injectable()
class FilemanagerService {
  constructor(private webdavClientService: WebDAVService) {}

  getMountPoints = async () => this.webdavClientService.getMountPoints();

  getFilesAtPath = async (path: string) => this.webdavClientService.getFilesAtPath(path);
}

export default FilemanagerService;
