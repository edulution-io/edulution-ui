import { Injectable } from '@nestjs/common';
import WebDAVService from './webdav/webdav.service';

@Injectable()
class FilemanagerService {
  constructor(private webdavClientService: WebDAVService) {}

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

  downloadFile = (username: string, url: string, filename: string) =>
    this.webdavClientService.downloadFile(username, url, filename);

  getBasicAuthDownloadLink = async (token: string, path: string, filename: string) =>
    this.webdavClientService.getBasicAuthDownloadLink(token, path, filename);

  fileExists = async (token: string, path: string) => this.webdavClientService.fileExists(token, path);

  getQrCode = async (token: string) => this.webdavClientService.getQrCode(token);
}

export default FilemanagerService;
