import { Test, TestingModule } from '@nestjs/testing';
import FilesharingService from './filesharing.service';
import mockFile from './filesharing.service.mock';

describe('FilesharingService', () => {
  let service: FilesharingService;

  const mockFileSharingService = {
    getMountPoints: jest.fn().mockResolvedValue([{ id: '1', name: 'MountPoint1' }]),
    getFilesAtPath: jest.fn().mockResolvedValue([{ name: 'file1.txt', size: 1234 }]),
    getDirAtPath: jest.fn().mockResolvedValue([{ name: 'folder1', size: 0 }]),
    createFolder: jest.fn().mockResolvedValue({ success: true }),
    createFile: jest.fn().mockResolvedValue({ success: true }),
    uploadFile: jest.fn().mockResolvedValue({ success: true }),
    deleteFileAtPath: jest.fn().mockResolvedValue({ success: true }),
    moveOrRenameResource: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesharingService,
        {
          provide: FilesharingService,
          useValue: mockFileSharingService,
        },
      ],
    }).compile();

    service = module.get<FilesharingService>(FilesharingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call getFilesAtPath on FileSharingService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const result = await service.getFilesAtPath(token, path);
    expect(service.getFilesAtPath).toHaveBeenCalledWith(token, path);
    expect(result).toEqual([{ name: 'file1.txt', size: 1234 }]);
  });

  it('should call getDirAtPath on FileSharingService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const result = await service.getDirAtPath(token, path);
    expect(service.getDirAtPath).toHaveBeenCalledWith(token, path);
    expect(result).toEqual([{ name: 'folder1', size: 0 }]);
  });

  it('should call createFolder on FileSharingService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const folderName = 'test-folder';
    const result = await service.createFolder(token, path, folderName);
    expect(service.createFolder).toHaveBeenCalledWith(token, path, folderName);
    expect(result).toEqual({ success: true });
  });

  it('should call createFile on FileSharingService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const fileName = 'test-file';
    const content = 'test-content';
    const result = await service.createFile(token, path, fileName, content);
    expect(service.createFile).toHaveBeenCalledWith(token, path, fileName, content);
    expect(result).toEqual({ success: true });
  });

  it('should call uploadFile on FileSharingService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const file = mockFile;
    const name = 'test-file';
    const result = await service.uploadFile(token, path, file, name);
    expect(service.uploadFile).toHaveBeenCalledWith(token, path, file, name);
    expect(result).toEqual({ success: true });
  });

  it('should call deleteFile on FileSharingService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const result = await service.deleteFileAtPath(token, path);
    expect(service.deleteFileAtPath).toHaveBeenCalledWith(token, path);
    expect(result).toEqual({ success: true });
  });

  it('should call renameFile on FileSharingService', async () => {
    const token = 'test-token';
    const path = '/test-path';
    const newName = 'new-test-file';
    const result = await service.moveOrRenameResource(token, path, newName);
    expect(service.moveOrRenameResource).toHaveBeenCalledWith(token, path, newName);
    expect(result).toEqual({ success: true });
  });
});
