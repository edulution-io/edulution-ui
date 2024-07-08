import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Readable } from 'stream';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import FilesharingService from './filesharing.service';
import FilesharingController from './filesharing.controller';

describe('FilesharingController', () => {
  let controller: FilesharingController;
  let service: FilesharingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesharingController],
      providers: [
        {
          provide: FilesharingService,
          useValue: {
            getMountPoints: jest.fn(),
            getFilesAtPath: jest.fn(),
            getFoldersAtPath: jest.fn(),
            createFolder: jest.fn(),
            createFile: jest.fn(),
            uploadFile: jest.fn(),
            deleteFolder: jest.fn(),
            renameFile: jest.fn(),
            moveFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FilesharingController>(FilesharingController);
    service = module.get<FilesharingService>(FilesharingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMountPoints', () => {
    it('should return mount points', async () => {
      const token = 'test-token';
      const result: DirectoryFile[] = [
        { basename: 'mount-point-1', etag: 'etag1', filename: 'filename1' },
        { basename: 'mount-point-2', etag: 'etag2', filename: 'filename2' },
      ];
      jest.spyOn(service, 'getMountPoints').mockResolvedValue(result);

      expect(await controller.getMountPoints(token)).toBe(result);
    });
  });

  describe('getFilesAtPath', () => {
    it('should return files at given path', async () => {
      const token = 'test-token';
      const path = 'test-path';
      const result: DirectoryFile[] = [
        { basename: 'file-1', etag: 'etag1', filename: 'filename1' },
        { basename: 'file-2', etag: 'etag2', filename: 'filename2' },
      ];
      jest.spyOn(service, 'getFilesAtPath').mockResolvedValue(result);

      expect(await controller.getFilesAtPath(token, path)).toBe(result);
    });
  });

  describe('getDirectoriesAtPath', () => {
    it('should return directories at given path', async () => {
      const token = 'test-token';
      const path = 'test-path';
      const result: DirectoryFile[] = [
        { basename: 'dir-1', etag: 'etag1', filename: 'filename1' },
        { basename: 'dir-2', etag: 'etag2', filename: 'filename2' },
      ];
      jest.spyOn(service, 'getFoldersAtPath').mockResolvedValue(result);

      expect(await controller.getDirectoriesAtPath(token, path)).toBe(result);
    });
  });

  describe('createFolder', () => {
    it('should create a folder and return result', async () => {
      const token = 'test-token';
      const body = { path: 'test-path', folderName: 'test-folder' };
      const result = { success: true };
      jest.spyOn(service, 'createFolder').mockResolvedValue(result);

      expect(await controller.createFolder(token, body)).toBe(result);
    });

    it('should throw an error if creation fails', async () => {
      const token = 'test-token';
      const body = { path: 'test-path', folderName: 'test-folder' };
      const result = { success: false, status: 400 };
      jest.spyOn(service, 'createFolder').mockResolvedValue(result);

      await expect(controller.createFolder(token, body)).rejects.toThrow(
        new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('createFile', () => {
    it('should create a file and return result', async () => {
      const token = 'test-token';
      const body = { path: 'test-path', fileName: 'test-file', content: 'test-content' };
      const result = { success: true };
      jest.spyOn(service, 'createFile').mockResolvedValue(result);

      expect(await controller.createFile(token, body)).toBe(result);
    });

    it('should throw an error if creation fails', async () => {
      const token = 'test-token';
      const body = { path: 'test-path', fileName: 'test-file', content: 'test-content' };
      const result = { success: false, status: 400 };
      jest.spyOn(service, 'createFile').mockResolvedValue(result);

      await expect(controller.createFile(token, body)).rejects.toThrow(
        new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('uploadFile', () => {
    it('should upload a file and return result', async () => {
      const token = 'test-token';
      const path = 'test-path';
      const name = 'test-file';
      const file: Express.Multer.File = {
        buffer: Buffer.from('test-content'),
        originalname: 'test-file.txt',
        fieldname: '',
        encoding: '',
        mimetype: '',
        size: 0,
        stream: new Readable({ read() {} }),
        destination: '',
        filename: '',
        path: '',
      };
      const result = { success: true, status: 200, filename: 'test-file.txt' };
      jest.spyOn(service, 'uploadFile').mockResolvedValue(result);

      expect(await controller.uploadFile(token, file, path, name)).toBe(result);
    });

    it('should throw an error if upload fails', async () => {
      const token = 'test-token';
      const path = 'test-path';
      const name = 'test-file';
      const file: Express.Multer.File = {
        buffer: Buffer.from('test-content'),
        originalname: 'test-file.txt',
        fieldname: '',
        encoding: '',
        mimetype: '',
        size: 0,
        stream: new Readable({ read() {} }),
        destination: '',
        filename: '',
        path: '',
      };
      const error = new Error('Upload failed');
      jest.spyOn(service, 'uploadFile').mockRejectedValue(error);

      await expect(controller.uploadFile(token, file, path, name)).rejects.toThrow(
        new Error('Failed to upload file: Error: Upload failed'),
      );
    });
  });

  describe('deleteResource', () => {
    it('should delete a resource and return result', async () => {
      const token = 'test-token';
      const path = 'test-path';
      const result = { success: true };
      jest.spyOn(service, 'deleteFolder').mockResolvedValue(result);

      expect(await controller.deleteResource(token, path)).toBe(result);
    });

    it('should throw an error if deletion fails', async () => {
      const token = 'test-token';
      const path = 'test-path';
      const result = { success: false, status: 400 };
      jest.spyOn(service, 'deleteFolder').mockResolvedValue(result);

      await expect(controller.deleteResource(token, path)).rejects.toThrow(
        new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('renameResource', () => {
    it('should rename a resource and return result', async () => {
      const token = 'test-token';
      const body = { originPath: 'test-origin-path', newPath: 'test-new-path' };
      const result = { success: true };
      jest.spyOn(service, 'renameFile').mockResolvedValue(result);

      expect(await controller.renameResource(token, body)).toBe(result);
    });

    it('should throw an error if renaming fails', async () => {
      const token = 'test-token';
      const body = { originPath: 'test-origin-path', newPath: 'test-new-path' };
      const result = { success: false, status: 400 };
      jest.spyOn(service, 'renameFile').mockResolvedValue(result);

      await expect(controller.renameResource(token, body)).rejects.toThrow(
        new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('moveResource', () => {
    it('should move a resource and return result', async () => {
      const token = 'test-token';
      const body = { originPath: 'test-origin-path', newPath: 'test-new-path' };
      const result = { success: true };
      jest.spyOn(service, 'moveFile').mockResolvedValue(result);

      expect(await controller.moveResource(token, body)).toBe(result);
    });

    it('should throw an error if moving fails', async () => {
      const token = 'test-token';
      const body = { originPath: 'test-origin-path', newPath: 'test-new-path' };
      const result = { success: false, status: 400 };
      jest.spyOn(service, 'moveFile').mockResolvedValue(result);

      await expect(controller.moveResource(token, body)).rejects.toThrow(
        new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });
});
