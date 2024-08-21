import CustomHttpException from '@libs/error/CustomHttpException';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import { Request } from 'express';
import { WebdavStatusReplay } from '@libs/filesharing/types/fileOperationResult';
import { Readable } from 'stream';
import axios, { AxiosHeaders, AxiosInstance, AxiosResponse } from 'axios';
import { HttpMethods, HttpMethodsWebDav, RequestResponseContentType } from '@libs/common/types/http-methods';
import { HttpStatus } from '@nestjs/common';
import CustomFile from '@libs/filesharing/types/customFile';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import FilesharingService from './filesharing.service';
import FilesystemService from './filesystem.service';
import OnlyofficeService from './onlyoffice.service';
import { mapToDirectories, mapToDirectoryFiles, transformWebdavResponse } from './filesharing.utilities';
import UsersService from '../users/users.service';
import WebdavClientFactory from './webdav.client.factory';

describe('FilesharingService', () => {
  let service: FilesharingService;
  let filesystemService: FilesystemService;
  let onlyofficeService: OnlyofficeService;
  let mockClient: AxiosInstance;

  beforeEach(() => {
    filesystemService = {
      fileLocation: jest.fn(),
      fetchFileStream: jest.fn(),
      transformWebdavResponse: jest.fn(),
    } as unknown as FilesystemService;

    onlyofficeService = {
      handleCallback: jest.fn(),
      generateOnlyOfficeToken: jest.fn(),
    } as unknown as OnlyofficeService;

    service = new FilesharingService({} as UsersService, onlyofficeService, filesystemService);

    Object.defineProperty(service, 'baseurl', {
      value: 'http://mock-baseurl.com',
      writable: true,
    });

    mockClient = {} as AxiosInstance;

    jest.spyOn(service as any, 'getClient').mockResolvedValue(mockClient);
  });

  describe('getFilesAtPath', () => {
    it('should successfully retrieve files at the specified path', async () => {
      const username = 'test-user';
      const path = '/test-path';
      const expectedResponse: DirectoryFileDTO[] = [
        {
          basename: 'file1.txt',
          etag: 'etag1',
          filename: '/test-path/file1.txt',
          lastmod: 'Mon, 24 Aug 2024 12:00:00 GMT',
          size: 1024,
          type: 'file',
        },
        {
          basename: 'file2.txt',
          etag: 'etag2',
          filename: '/test-path/file2.txt',
          lastmod: 'Tue, 25 Aug 2024 13:00:00 GMT',
          size: 2048,
          type: 'file',
        },
      ];

      const executeSpy = jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockResolvedValue(expectedResponse);

      const result = await service.getFilesAtPath(username, path);

      expect(executeSpy).toHaveBeenCalledWith(
        mockClient,
        {
          method: HttpMethodsWebDav.PROPFIND,
          url: `http://mock-baseurl.com${getPathWithoutWebdav(path)}`,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.stringContaining('<?xml version="1.0"?>'),
        },
        true,
        FileSharingErrorMessage.FileNotFound,
        mapToDirectoryFiles,
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw CustomHttpException if executeWebdavRequest throws an error', async () => {
      const username = 'test-user';
      const path = '/test-path';

      jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockRejectedValue(new CustomHttpException(FileSharingErrorMessage.FileNotFound, HttpStatus.NOT_FOUND));

      await expect(service.getFilesAtPath(username, path)).rejects.toThrow(CustomHttpException);
      await expect(service.getFilesAtPath(username, path)).rejects.toThrow(FileSharingErrorMessage.FileNotFound);
    });
  });

  describe('getDirAtPath', () => {
    it('should successfully retrieve directory contents', async () => {
      const username = 'test-user';
      const path = '/test-path';
      const expectedResponse: DirectoryFileDTO[] = [
        {
          basename: 'file1.txt',
          etag: 'etag1',
          filename: '/test-path/file1.txt',
          lastmod: 'Mon, 24 Aug 2024 12:00:00 GMT',
          size: 1024,
          type: 'file',
        },
        {
          basename: 'folder1',
          etag: 'etag2',
          filename: '/test-path/folder1',
          lastmod: 'Mon, 24 Aug 2024 12:00:00 GMT',
          type: 'directory',
        },
      ];

      const executeSpy = jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockResolvedValue(expectedResponse);

      const result = await service.getDirAtPath(username, path);

      expect(executeSpy).toHaveBeenCalledWith(
        mockClient,
        {
          method: HttpMethodsWebDav.PROPFIND,
          url: `http://mock-baseurl.com${getPathWithoutWebdav(path)}`,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.any(String),
          headers: { 'Content-Type': RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED },
        },
        true,
        FileSharingErrorMessage.FolderNotFound,
        mapToDirectories,
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw CustomHttpException if executeWebdavRequest throws an error', async () => {
      const username = 'test-user';
      const path = '/test-path';

      jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockRejectedValue(new CustomHttpException(FileSharingErrorMessage.FolderNotFound, HttpStatus.NOT_FOUND));

      await expect(service.getDirAtPath(username, path)).rejects.toThrow(CustomHttpException);
      await expect(service.getDirAtPath(username, path)).rejects.toThrow(FileSharingErrorMessage.FolderNotFound);
    });
  });

  describe('createFolder', () => {
    it('should successfully create a folder', async () => {
      const username = 'test-user';
      const path = '/test-path';
      const folderName = 'test-folder';
      const expectedResponse: WebdavStatusReplay = { success: true, status: 200 };

      const executeSpy = jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockResolvedValue(expectedResponse);

      const result = await service.createFolder(username, path, folderName);

      expect(executeSpy).toHaveBeenCalledWith(
        mockClient,
        {
          method: HttpMethodsWebDav.MKCOL,
          url: `http://mock-baseurl.com${path}/${folderName}`,
        },
        true,
        FileSharingErrorMessage.FolderCreationFailed,
        transformWebdavResponse,
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw CustomHttpException if executeWebdavRequest throws an error', async () => {
      const username = 'test-user';
      const path = '/test-path';
      const folderName = 'test-folder';

      jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockRejectedValue(
          new CustomHttpException(FileSharingErrorMessage.FolderCreationFailed, HttpStatus.INTERNAL_SERVER_ERROR),
        );

      await expect(service.createFolder(username, path, folderName)).rejects.toThrow(CustomHttpException);
      await expect(service.createFolder(username, path, folderName)).rejects.toThrow(
        FileSharingErrorMessage.FolderCreationFailed,
      );
    });
  });

  describe('createFile', () => {
    it('should successfully create a file with the specified content', async () => {
      const username = 'test-user';
      const path = '/test-path';
      const fileName = 'test-file.txt';
      const content = 'This is a test file content';
      const expectedResponse: WebdavStatusReplay = { success: true, status: 200 };

      const executeSpy = jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockResolvedValue(expectedResponse);

      const result = await service.createFile(username, path, fileName, content);

      expect(executeSpy).toHaveBeenCalledWith(
        mockClient,
        {
          method: HttpMethods.PUT,
          url: `http://mock-baseurl.com${getPathWithoutWebdav(path)}/${fileName}`,
          headers: { 'Content-Type': RequestResponseContentType.TEXT_PLAIN },
          data: content,
        },
        true,
        FileSharingErrorMessage.CreationFailed,
        transformWebdavResponse,
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should successfully create a file with the specified content without content', async () => {
      const username = 'test-user';
      const path = '/test-path';
      const fileName = 'test-file.txt';
      const expectedResponse: WebdavStatusReplay = { success: true, status: 200 };

      const executeSpy = jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockResolvedValue(expectedResponse);

      const result = await service.createFile(username, path, fileName);

      expect(executeSpy).toHaveBeenCalledWith(
        mockClient,
        {
          method: HttpMethods.PUT,
          url: `http://mock-baseurl.com${getPathWithoutWebdav(path)}/${fileName}`,
          headers: { 'Content-Type': RequestResponseContentType.TEXT_PLAIN },
          data: '',
        },
        true,
        FileSharingErrorMessage.CreationFailed,
        transformWebdavResponse,
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw CustomHttpException if executeWebdavRequest throws an error', async () => {
      const username = 'test-user';
      const path = '/test-path';
      const fileName = 'test-file.txt';
      const content = 'This is a test file content';

      jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockRejectedValue(
          new CustomHttpException(FileSharingErrorMessage.CreationFailed, HttpStatus.INTERNAL_SERVER_ERROR),
        );

      await expect(service.createFile(username, path, fileName, content)).rejects.toThrow(CustomHttpException);
      await expect(service.createFile(username, path, fileName, content)).rejects.toThrow(
        FileSharingErrorMessage.CreationFailed,
      );
    });
  });

  describe('uploadFile', () => {
    it('should successfully upload a file', async () => {
      const username = 'test-user';
      const path = '/test-path';
      const name = 'test-file.txt';
      const file: CustomFile = {
        buffer: Buffer.from('test content'),
        stream: new Readable(),
        fieldname: 'file',
        originalname: 'test-file.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 1024,
        destination: '/uploads',
        filename: 'test-file.txt',
        path: '/uploads/test-file.txt',
      };
      const expectedResponse: WebdavStatusReplay = { success: true, status: 200, filename: name };

      const executeSpy = jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockResolvedValue(expectedResponse);

      const result = await service.uploadFile(username, path, file, name);

      expect(executeSpy).toHaveBeenCalledWith(
        mockClient,
        {
          method: HttpMethods.PUT,
          url: `http://mock-baseurl.com${path}/${name}`,
          headers: { 'Content-Type': file.mimetype },
          data: file.buffer,
        },
        false,
        FileSharingErrorMessage.UploadFailed,
        transformWebdavResponse,
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw CustomHttpException if executeWebdavRequest throws an error', async () => {
      const username = 'test-user';
      const path = '/test-path';
      const name = 'test-file.txt';
      const file: CustomFile = {
        buffer: Buffer.from('test content'),
        stream: new Readable(),
        fieldname: 'file',
        originalname: 'test-file.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 1024,
        destination: '/uploads',
        filename: 'test-file.txt',
        path: '/uploads/test-file.txt',
      };

      jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockRejectedValue(
          new CustomHttpException(FileSharingErrorMessage.UploadFailed, HttpStatus.INTERNAL_SERVER_ERROR),
        );

      await expect(service.uploadFile(username, path, file, name)).rejects.toThrow(CustomHttpException);
      await expect(service.uploadFile(username, path, file, name)).rejects.toThrow(
        FileSharingErrorMessage.UploadFailed,
      );
    });
  });

  describe('deleteFileAtPath', () => {
    it('should successfully delete a file at the specified path', async () => {
      const username = 'test-user';
      const path = '/test-path';
      const expectedResponse: WebdavStatusReplay = { success: true, status: 200 };

      const executeSpy = jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockResolvedValue(expectedResponse);

      const result = await service.deleteFileAtPath(username, path);

      expect(executeSpy).toHaveBeenCalledWith(
        mockClient,
        {
          method: HttpMethods.DELETE,
          url: `http://mock-baseurl.com${path}`,
          headers: { 'Content-Type': RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED },
        },
        true,
        FileSharingErrorMessage.DeletionFailed,
        transformWebdavResponse,
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw CustomHttpException if executeWebdavRequest throws an error', async () => {
      const username = 'test-user';
      const path = '/test-path';

      jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockRejectedValue(new CustomHttpException(FileSharingErrorMessage.DeletionFailed, HttpStatus.NOT_FOUND));

      await expect(service.deleteFileAtPath(username, path)).rejects.toThrow(CustomHttpException);
      await expect(service.deleteFileAtPath(username, path)).rejects.toThrow(FileSharingErrorMessage.DeletionFailed);
    });
  });

  describe('moveOrRenameResource', () => {
    it('should successfully move or rename a resource', async () => {
      const username = 'test-user';
      const originPath = '/origin-path';
      const newPath = '/new-path';
      const expectedResponse: WebdavStatusReplay = { success: true, status: 200 };

      const executeSpy = jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockResolvedValue(expectedResponse);

      const result = await service.moveOrRenameResource(username, originPath, newPath);

      expect(executeSpy).toHaveBeenCalledWith(
        mockClient,
        {
          method: HttpMethodsWebDav.MOVE,
          url: `http://mock-baseurl.com${originPath}`,
          headers: {
            Destination: `http://mock-baseurl.com${newPath}`,
            'Content-Type': RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED,
          },
        },
        true,
        FileSharingErrorMessage.RenameFailed,
        transformWebdavResponse,
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw CustomHttpException if executeWebdavRequest throws an error', async () => {
      const username = 'test-user';
      const originPath = '/origin-path';
      const newPath = '/new-path';

      jest
        .spyOn(FilesharingService as any, 'executeWebdavRequest')
        .mockRejectedValue(new CustomHttpException(FileSharingErrorMessage.RenameFailed, HttpStatus.NOT_FOUND));

      await expect(service.moveOrRenameResource(username, originPath, newPath)).rejects.toThrow(CustomHttpException);
      await expect(service.moveOrRenameResource(username, originPath, newPath)).rejects.toThrow(
        FileSharingErrorMessage.RenameFailed,
      );
    });
  });

  describe('getWebDavFileStream', () => {
    it('should return a Readable stream if fetchFileStream returns a Readable', async () => {
      const username = 'test-user';
      const filePath = 'test-path';
      const mockStream = new Readable();
      jest.spyOn(filesystemService, 'fetchFileStream').mockResolvedValue(mockStream);

      const result = await service.getWebDavFileStream(username, filePath);

      expect(filesystemService.fetchFileStream).toHaveBeenCalledWith(username, 'http://mock-baseurl.comtest-path');
      expect(result).toBe(mockStream);
    });

    it('should return resp.data if fetchFileStream does not return a Readable', async () => {
      const username = 'test-user';
      const filePath = 'test-path';
      const mockData: AxiosResponse<Readable, any> = {
        data: new Readable(),
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config: {
          headers: new AxiosHeaders(),
        },
      };
      jest.spyOn(filesystemService, 'fetchFileStream').mockResolvedValue(mockData);

      const result = await service.getWebDavFileStream(username, filePath);

      expect(filesystemService.fetchFileStream).toHaveBeenCalledWith(username, 'http://mock-baseurl.comtest-path');
      expect(result).toBe(mockData.data);
    });

    it('should throw CustomHttpException if fetchFileStream throws an error', async () => {
      const username = 'test-user';
      const filePath = 'test-path';
      jest.spyOn(filesystemService, 'fetchFileStream').mockRejectedValue(new Error('Fetch failed'));

      await expect(service.getWebDavFileStream(username, filePath)).rejects.toThrow(CustomHttpException);
      await expect(service.getWebDavFileStream(username, filePath)).rejects.toThrow(
        FileSharingErrorMessage.DownloadFailed,
      );
    });
  });

  describe('deleteFileFromServer', () => {
    it('should call deleteFile on FilesystemService', async () => {
      jest.spyOn(FilesystemService, 'deleteFile').mockResolvedValue(undefined);

      await service.deleteFileFromServer('test-path');

      expect(FilesystemService.deleteFile).toHaveBeenCalledWith('test-path');
    });

    it('should throw CustomHttpException if deleteFile fails', async () => {
      jest.spyOn(FilesystemService, 'deleteFile').mockRejectedValue(new Error('Deletion failed'));

      await expect(service.deleteFileFromServer('test-path')).rejects.toThrow(CustomHttpException);
      await expect(service.deleteFileFromServer('test-path')).rejects.toThrow(FileSharingErrorMessage.DeletionFailed);
    });
  });

  describe('handleCallback', () => {
    it('should call handleCallback on onlyofficeService with correct parameters', async () => {
      const req = {} as Request;
      const path = 'test-path';
      const filename = 'test-filename';
      const eduToken = 'test-token';

      await service.handleCallback(req, path, filename, eduToken);

      expect(onlyofficeService.handleCallback).toHaveBeenCalledWith(req, path, filename, eduToken, service.uploadFile);
    });
  });

  describe('fileLocation', () => {
    it('should call fileLocation on filesystemService with correct parameters', async () => {
      const username = 'test-user';
      const filePath = 'test-path';
      const filename = 'test-filename';
      const expectedResponse: WebdavStatusReplay = { success: true, status: 200 };

      jest.spyOn(filesystemService, 'fileLocation').mockResolvedValue(expectedResponse);

      const result = await service.fileLocation(username, filePath, filename);

      expect(filesystemService.fileLocation).toHaveBeenCalledWith(username, filePath, filename);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getOnlyOfficeToken', () => {
    it('should call generateOnlyOfficeToken on onlyofficeService with correct parameters', async () => {
      const payload = 'test-payload';
      const expectedToken = 'test-token';

      jest.spyOn(onlyofficeService, 'generateOnlyOfficeToken').mockResolvedValue(expectedToken);

      const result = await service.getOnlyOfficeToken(payload);

      expect(onlyofficeService.generateOnlyOfficeToken).toHaveBeenCalledWith(payload);
      expect(result).toEqual(expectedToken);
    });
  });

  describe('FilesharingService1', () => {
    let executeSpy: jest.SpyInstance;

    beforeEach(() => {
      executeSpy = jest.spyOn(FilesharingService as any, 'executeWebdavRequest').mockResolvedValue({
        status: 200,
        success: true,
      });
    });

    it('should call executeWebdavRequest with correct parameters', async () => {
      const username = 'testuser';
      const originPath = '/original/path/file.txt';
      const newPath = '/new/path/file.txt';
      const expectedResponse = { status: 200, success: true };

      const result = await service.moveOrRenameResource(username, originPath, newPath);
      expect(executeSpy).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({
          method: 'move',
          url: `http://mock-baseurl.com${originPath}`,
          headers: {
            Destination: `http://mock-baseurl.com${newPath}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
        true,
        FileSharingErrorMessage.RenameFailed,
        expect.any(Function),
      );

      expect(result).toEqual(expectedResponse);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('WebdavClientFactory', () => {
    it('should create a WebDAV client with the correct base URL and headers', () => {
      const baseUrl = 'http://example.com/webdav';
      const username = 'testuser';
      const password = 'testpassword';

      const expectedToken = Buffer.from(`${username}:${password}`).toString('base64');
      const axiosCreateSpy = jest.spyOn(axios, 'create');

      const client = WebdavClientFactory.createWebdavClient(baseUrl, username, password);
      expect(axiosCreateSpy).toHaveBeenCalledWith({
        baseURL: baseUrl,
        headers: {
          'Content-Type': 'application/xml',
          Authorization: `Basic ${expectedToken}`,
        },
      });

      expect(client).toBeInstanceOf(Object);
      axiosCreateSpy.mockRestore();
    });
  });
});
