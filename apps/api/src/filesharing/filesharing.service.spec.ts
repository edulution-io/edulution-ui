import { Test, TestingModule } from '@nestjs/testing';
import FilesharingService from './filesharing.service';
import WebdavService from './webdav/webdav.service';

describe('FilesharingService', () => {
  let service: FilesharingService;
  let webdavService: WebdavService;

  const mockWebdavService = {
    getMountPoints: jest.fn().mockResolvedValue([{ id: '1', name: 'MountPoint1' }]),
    getFilesAtPath: jest.fn().mockResolvedValue([{ name: 'file1.txt', size: 1234 }]),
    getDirAtPath: jest.fn().mockResolvedValue([{ name: 'folder1', size: 0 }]),
    createFolder: jest.fn().mockResolvedValue({ success: true }),
    createFile: jest.fn().mockResolvedValue({ success: true }),
    uploadFile: jest.fn().mockResolvedValue({ success: true }),
    deleteFile: jest.fn().mockResolvedValue({ success: true }),
    renameFile: jest.fn().mockResolvedValue({ success: true }),
    moveItems: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesharingService,
        {
          provide: WebdavService,
          useValue: mockWebdavService,
        },
      ],
    }).compile();

    service = module.get<FilesharingService>(FilesharingService);
    webdavService = module.get<WebdavService>(WebdavService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call getMountPoints on WebdavService', async () => {
    const token = 'test-token';
    const result = await service.getMountPoints(token);
    expect(webdavService.getMountPoints).toHaveBeenCalledWith(token);
    expect(result).toEqual([{ id: '1', name: 'MountPoint1' }]);
  });

  it('should call getFilesAtPath on WebdavService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const result = await service.getFilesAtPath(token, path);
    expect(webdavService.getFilesAtPath).toHaveBeenCalledWith(token, path);
    expect(result).toEqual([{ name: 'file1.txt', size: 1234 }]);
  });

  it('should call getFoldersAtPath on WebdavService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const result = await service.getFoldersAtPath(token, path);
    expect(webdavService.getDirAtPath).toHaveBeenCalledWith(token, path);
    expect(result).toEqual([{ name: 'folder1', size: 0 }]);
  });

  it('should call createFolder on WebdavService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const folderName = 'test-folder';
    const result = await service.createFolder(token, path, folderName);
    expect(webdavService.createFolder).toHaveBeenCalledWith(token, path, folderName);
    expect(result).toEqual({ success: true });
  });

  it('should call createFile on WebdavService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const fileName = 'test-file';
    const content = 'test-content';
    const result = await service.createFile(token, path, fileName, content);
    expect(webdavService.createFile).toHaveBeenCalledWith(token, path, fileName, content);
    expect(result).toEqual({ success: true });
  });

  it('should call uploadFile on WebdavService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const file = { buffer: Buffer.from('test') } as Express.Multer.File;
    const name = 'test-file';
    const result = await service.uploadFile(token, path, file, name);
    expect(webdavService.uploadFile).toHaveBeenCalledWith(token, path, file, name);
    expect(result).toEqual({ success: true });
  });

  it('should call deleteFolder on WebdavService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const result = await service.deleteFolder(token, path);
    expect(webdavService.deleteFile).toHaveBeenCalledWith(token, path);
    expect(result).toEqual({ success: true });
  });

  it('should call renameFile on WebdavService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const newName = 'new-test-file';
    const result = await service.renameFile(token, path, newName);
    expect(webdavService.renameFile).toHaveBeenCalledWith(token, path, newName);
    expect(result).toEqual({ success: true });
  });

  it('should call moveFile on WebdavService', async () => {
    const token = 'test-token';
    const originPath = '/origin-path';
    const newPath = '/new-path';
    const result = await service.moveFile(token, originPath, newPath);
    expect(webdavService.moveItems).toHaveBeenCalledWith(token, originPath, newPath);
    expect(result).toEqual({ success: true });
  });
});
