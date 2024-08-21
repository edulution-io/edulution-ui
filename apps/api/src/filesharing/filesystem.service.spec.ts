// eslint-disable-next-line max-classes-per-file
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { Readable, Writable } from 'stream';
import { createWriteStream, existsSync, mkdirSync, promises as fsPromises, readFileSync, writeFileSync } from 'fs';
import axios, { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import CustomHttpException from '@libs/error/CustomHttpException';
import { HttpStatus } from '@nestjs/common';
import { resolve } from 'path';
import OnlyOfficeCallbackData from '@libs/filesharing/types/onlyOfficeCallBackData';
import outputFolder from '@libs/filesharing/utils/outputFolder';
import UsersService from '../users/users.service';
import FilesystemService from './filesystem.service';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createWriteStream: jest.fn(),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  promises: {
    unlink: jest.fn(),
  },
}));

jest.mock('axios');

class MockReadable extends Readable {
  // eslint-disable-next-line no-underscore-dangle
  _read(_size: number) {
    this.push('data');
    this.push(null);
  }
}

class MockWritable extends Writable {
  // eslint-disable-next-line no-underscore-dangle
  _write(_chunk: any, _encoding: string, callback: (error?: Error | null) => void) {
    callback();
  }
}

describe('FilesystemService', () => {
  let service: FilesystemService;
  let userService: UsersService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesystemService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getPassword: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FilesystemService>(FilesystemService);
    userService = module.get<UsersService>(UsersService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('FilesystemService.saveFileStream', () => {
    it('should save file when stream is an AxiosResponse', async () => {
      const mockStream = new MockReadable();
      const mockWriteStream = new MockWritable();
      const mockAxiosResponse = { data: mockStream } as AxiosResponse<Readable>;

      (createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);

      await FilesystemService.saveFileStream(mockAxiosResponse, 'path/to/output');

      expect(createWriteStream).toHaveBeenCalledWith('path/to/output');
    });

    it('should save file when stream is a Readable stream', async () => {
      const mockStream = new MockReadable();
      const mockWriteStream = new MockWritable();

      (createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);

      await FilesystemService.saveFileStream(mockStream, 'path/to/output');

      expect(createWriteStream).toHaveBeenCalledWith('path/to/output');
    });
  });

  describe('fetchFileStream', () => {
    it('should fetch file stream successfully', async () => {
      const mockStream = new Readable();
      const mockResponse: Partial<AxiosResponse<Readable>> = {
        data: mockStream,
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as AxiosResponse<Readable>));
      jest.spyOn(userService, 'getPassword').mockResolvedValue('password');

      const { data } = (await service.fetchFileStream(
        'username',
        'http://example.com/file',
        true,
      )) as AxiosResponse<Readable>;

      expect(httpService.get).toHaveBeenCalledWith('http://username:password@example.com/file', {
        responseType: 'stream',
      });
      expect(data).toBe(mockStream);
    });

    it('should fetch file stream successfully no default', async () => {
      const mockStream = new Readable();
      const mockResponse: Partial<AxiosResponse<Readable>> = {
        data: mockStream,
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as AxiosResponse<Readable>));
      jest.spyOn(userService, 'getPassword').mockResolvedValue('password');

      const { data } = (await service.fetchFileStream(
        'username',
        'http://example.com/file',
      )) as AxiosResponse<Readable>;

      expect(httpService.get).toHaveBeenCalledWith('http://username:password@example.com/file', {
        responseType: 'stream',
      });
      expect(data).toBe(undefined);
    });

    it('should throw CustomHttpException if fetching fails', async () => {
      jest.spyOn(userService, 'getPassword').mockRejectedValue(new Error('Network Error'));

      await expect(service.fetchFileStream('username', 'http://example.com/file', true)).rejects.toThrow(
        CustomHttpException,
      );
    });
  });

  describe('ensureDirectoryExists', () => {
    it('should create directory if it does not exist', () => {
      (existsSync as jest.Mock).mockReturnValue(false);

      FilesystemService.ensureDirectoryExists('path/to/dir');

      expect(mkdirSync).toHaveBeenCalledWith('path/to/dir', { recursive: true });
    });

    it('should not create directory if it already exists', () => {
      (existsSync as jest.Mock).mockReturnValue(true);

      FilesystemService.ensureDirectoryExists('path/to/dir');

      expect(mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('generateHashedFilename', () => {
    it('should generate hashed filename correctly', () => {
      const hash = FilesystemService.generateHashedFilename('path/to/file', 'file.txt');

      expect(hash).toMatch(/^[a-f0-9]{64}\.txt$/);
    });
  });

  describe('getOutputFilePath', () => {
    it('should return correct output file path', () => {
      const outputPath = FilesystemService.getOutputFilePath('path/to/dir', 'hashedfilename.txt');

      expect(outputPath).toBe('path/to/dir/hashedfilename.txt');
    });
  });

  describe('retrieveAndSaveFile', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should retrieve and save file successfully', async () => {
      const mockResponse = { data: new ArrayBuffer(8) };
      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const body: OnlyOfficeCallbackData = {
        status: 2,
        url: 'http://example.com/file',
        key: 'some-key',
      };

      (mkdirSync as jest.Mock).mockImplementation(() => true);
      (writeFileSync as jest.Mock).mockImplementation(() => {});
      (existsSync as jest.Mock).mockReturnValue(true);
      (readFileSync as jest.Mock).mockReturnValue(Buffer.from(mockResponse.data));

      const result = await FilesystemService.retrieveAndSaveFile('test.txt', body);

      expect(axios.get).toHaveBeenCalledWith('http://example.com/file', { responseType: 'arraybuffer' });
      expect(result).toEqual({
        fieldname: 'file',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        buffer: expect.any(Buffer),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        size: expect.any(Number),
      });
    });

    it('should return undefined if status is not 2 or 4', async () => {
      const body: OnlyOfficeCallbackData = {
        status: 1,
        url: 'http://example.com/file',
        key: 'some-key',
      };

      const result = await FilesystemService.retrieveAndSaveFile('test.txt', body);

      expect(result).toBeUndefined();
    });

    it('should throw CustomHttpException if retrieval fails', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

      const body: OnlyOfficeCallbackData = {
        status: 2,
        url: 'http://example.com/file',
        key: 'some-key',
      };

      await expect(FilesystemService.retrieveAndSaveFile('test.txt', body)).rejects.toThrow(CustomHttpException);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      await FilesystemService.deleteFile('test.txt');

      expect(fsPromises.unlink).toHaveBeenCalledWith(resolve(outputFolder, 'test.txt'));
    });

    it('should throw CustomHttpException if file deletion fails', async () => {
      (fsPromises.unlink as jest.Mock).mockRejectedValue(new Error('Delete Error'));

      await expect(FilesystemService.deleteFile('test.txt')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('fileLocation', () => {
    it('should return file location with success', async () => {
      const mockStream = new Readable();
      const mockUser = { username: 'username' };
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(service, 'fetchFileStream').mockResolvedValue(mockStream);
      jest.spyOn(FilesystemService, 'generateHashedFilename').mockReturnValue('hashedfile.txt');
      jest.spyOn(FilesystemService, 'saveFileStream').mockResolvedValue(undefined);

      const result = await service.fileLocation('username', 'path/to/file', 'file.txt');

      expect(result).toEqual({ success: true, status: HttpStatus.OK, data: 'hashedfile.txt' });
    });

    it('should throw CustomHttpException if user not found', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      const result = await service.fileLocation('username', 'path/to/file', 'file.txt');

      expect(result).toEqual({
        success: false,
        status: 404,
      });
    });

    it('should throw CustomHttpException if fetchFileStream fails', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue({ username: 'username' });
      jest.spyOn(service, 'fetchFileStream').mockRejectedValue(new Error('Network Error'));

      await expect(service.fileLocation('username', 'path/to/file', 'file.txt')).rejects.toThrow(CustomHttpException);
    });
  });
});
