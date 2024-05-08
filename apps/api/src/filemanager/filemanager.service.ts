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

  uploadFile = async (path: string, file: File) => this.webdavClientService.uploadFile(path, file);

  deleteFolder = async (path: string) => this.webdavClientService.deleteFile(path);

  renameFile = async (path: string, newName: string) => this.webdavClientService.renameFile(path, newName);

  moveFile = async (originPath: string, newPath: string) => this.webdavClientService.moveItems(originPath, newPath);

  downloadFile = (path: string) => this.webdavClientService.getFileDownloadLink(path);

  fileExists = async (path: string) => this.webdavClientService.fileExists(path);

  getQrCode = async () => this.webdavClientService.getQrCode();
}

export default FilemanagerService;
