import { Injectable } from '@nestjs/common';
import WebDAVService from './webdav/webdav.service';

@Injectable()
class FilemanagerService {
  constructor(private webdavClientService: WebDAVService) {}

  getMountPoints = async () => this.webdavClientService.getMountPoints();

  getFilesAtPath = async (path: string) => this.webdavClientService.getFilesAtPath(path);

  createFolder = async (path: string, folderName: string) => this.webdavClientService.createFolder(path, folderName);

  createFile = async (path: string, fileName: string, content: string) =>
    this.webdavClientService.createFile(path, fileName, content);

  uploadFile = async (path: string, file: File, name: string) => this.webdavClientService.uploadFile(path, file, name);

  deleteFolder = async (path: string) => this.webdavClientService.deleteFile(path);

  renameFile = async (path: string, newName: string) => this.webdavClientService.renameFile(path, newName);

  moveFile = async (originPath: string, newPath: string) => this.webdavClientService.moveItems(originPath, newPath);
}

export default FilemanagerService;
