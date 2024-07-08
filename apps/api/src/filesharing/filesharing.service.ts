import { Injectable } from '@nestjs/common';
import WebdavService from './webdav/webdav.service';

@Injectable()
class FilesharingService {
  constructor(private webdavClientService: WebdavService) {}

  getMountPoints = async (token: string) => this.webdavClientService.getMountPoints(token);

  getFilesAtPath = async (token: string, path: string) => this.webdavClientService.getFilesAtPath(token, path);

  getFoldersAtPath = async (token: string, path: string) => this.webdavClientService.getDirAtPath(token, path);

  createFolder = async (token: string, path: string, folderName: string) =>
    this.webdavClientService.createFolder(token, path, folderName);

  createFile = async (token: string, path: string, fileName: string, content: string) =>
    this.webdavClientService.createFile(token, path, fileName, content);

  uploadFile = async (token: string, path: string, file: Express.Multer.File, name: string) =>
    this.webdavClientService.uploadFile(token, path, file, name);

  deleteFolder = async (token: string, path: string) => this.webdavClientService.deleteFile(token, path);

  renameFile = async (token: string, path: string, newName: string) =>
    this.webdavClientService.renameFile(token, path, newName);

  moveFile = async (token: string, originPath: string, newPath: string) =>
    this.webdavClientService.moveItems(token, originPath, newPath);
}
export default FilesharingService;
