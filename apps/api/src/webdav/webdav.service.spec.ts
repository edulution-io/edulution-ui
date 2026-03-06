/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

/* eslint-disable @typescript-eslint/dot-notation */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import WebdavService from './webdav.service';
import UsersService from '../users/users.service';
import WebdavSharesService from './shares/webdav-shares.service';

jest.mock('./webdav.client.factory', () => ({
  __esModule: true,
  default: {
    createWebdavClient: jest.fn().mockReturnValue({ request: jest.fn() }),
  },
}));

const mockWebdavShare = {
  url: 'https://webdav.example.com/remote.php/dav/files/user/',
  pathname: '/remote.php/dav/files/user',
  type: 'nextcloud',
};

describe(WebdavService.name, () => {
  let service: WebdavService;
  let usersService: Record<string, jest.Mock>;
  let webdavSharesService: Record<string, jest.Mock>;
  let mockClient: { request: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockClient = { request: jest.fn() };

    usersService = {
      getPassword: jest.fn().mockResolvedValue('encrypted-password'),
    };

    webdavSharesService = {
      getWebdavShareFromCache: jest.fn().mockResolvedValue(mockWebdavShare),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebdavService,
        { provide: UsersService, useValue: usersService },
        { provide: WebdavSharesService, useValue: webdavSharesService },
      ],
    }).compile();

    service = module.get<WebdavService>(WebdavService);

    jest.spyOn(service, 'getClient').mockResolvedValue(mockClient as never);
  });

  afterEach(() => {
    service['webdavClientCache'].forEach((entry) => clearTimeout(entry.timeout));
    service['webdavClientCache'].clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('invalidateClientCache', () => {
    it('should clear the client cache', () => {
      const timer = setTimeout(() => {}, 1000);
      service['webdavClientCache'].set('testuser', { client: mockClient as never, timeout: timer });

      service.invalidateClientCache();

      clearTimeout(timer);
      expect(service['webdavClientCache'].size).toBe(0);
    });
  });

  describe('initializeClient', () => {
    it('should create and cache a client', async () => {
      jest.spyOn(service, 'getClient').mockRestore();

      await service.initializeClient('testuser', 'default');

      expect(usersService.getPassword).toHaveBeenCalledWith('testuser');
      expect(webdavSharesService.getWebdavShareFromCache).toHaveBeenCalledWith('default');
      expect(service['webdavClientCache'].has('testuser')).toBe(true);
    });
  });

  describe('getClient', () => {
    it('should return cached client on second call', async () => {
      jest.spyOn(service, 'getClient').mockRestore();

      await service.initializeClient('testuser', 'default');
      const client = await service.getClient('testuser', 'default');

      expect(client).toBeDefined();
      expect(usersService.getPassword).toHaveBeenCalledTimes(1);
    });
  });

  describe('executeWebdavRequest', () => {
    it('should execute request and return data', async () => {
      mockClient.request.mockResolvedValue({ status: 200, data: '<xml>response</xml>' });

      const result = await WebdavService.executeWebdavRequest(
        mockClient as never,
        { method: 'PROPFIND', url: 'https://webdav.example.com/' },
        FileSharingErrorMessage.FileNotFound,
      );

      expect(result).toBe('<xml>response</xml>');
    });

    it('should apply transformer when provided', async () => {
      mockClient.request.mockResolvedValue({ status: 200, data: 'raw-data' });

      const transformer = (data: string) => data.toUpperCase();
      const result = await WebdavService.executeWebdavRequest(
        mockClient as never,
        { method: 'PROPFIND', url: 'https://webdav.example.com/' },
        FileSharingErrorMessage.FileNotFound,
        transformer,
      );

      expect(result).toBe('RAW-DATA');
    });

    it('should throw CustomHttpException when request fails', async () => {
      mockClient.request.mockRejectedValue(new Error('Network error'));

      await expect(
        WebdavService.executeWebdavRequest(
          mockClient as never,
          { method: 'PROPFIND', url: 'https://webdav.example.com/' },
          FileSharingErrorMessage.FileNotFound,
        ),
      ).rejects.toMatchObject({
        message: FileSharingErrorMessage.FileNotFound,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });

    it('should throw when WebDAV response status is not 2xx', async () => {
      mockClient.request.mockResolvedValue({ status: 404, statusText: 'Not Found' });

      await expect(
        WebdavService.executeWebdavRequest(
          mockClient as never,
          { method: 'propfind', url: 'https://webdav.example.com/' },
          FileSharingErrorMessage.FileNotFound,
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('getFilesAtPath', () => {
    it('should call request with PROPFIND method', async () => {
      mockClient.request.mockResolvedValue({ status: 207, data: '<xml>files</xml>' });

      await service.getFilesAtPath('testuser', '/Documents/', 'default');

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'propfind',
        }),
      );
    });
  });

  describe('getDirectoryAtPath', () => {
    it('should call request with PROPFIND for directories', async () => {
      mockClient.request.mockResolvedValue({ status: 207, data: '<xml>dirs</xml>' });

      await service.getDirectoryAtPath('testuser', '/Documents/', 'default');

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'propfind',
        }),
      );
    });
  });

  describe('createFolder', () => {
    it('should call request with MKCOL method', async () => {
      mockClient.request.mockResolvedValue({ status: 201, data: { status: 201 } });

      await service.createFolder('testuser', '/Documents', 'NewFolder', 'default');

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'mkcol',
        }),
      );
    });
  });

  describe('deletePath', () => {
    it('should call request with DELETE method', async () => {
      mockClient.request.mockResolvedValue({ status: 204, data: { status: 204 } });

      await service.deletePath('testuser', '/Documents/file.txt', 'default');

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'delete',
        }),
      );
    });
  });

  describe('moveOrRenameResource', () => {
    it('should call request with MOVE method and Destination header', async () => {
      mockClient.request.mockResolvedValue({ status: 201, data: { status: 201 } });

      await service.moveOrRenameResource('testuser', '/Documents/old.txt', '/Documents/new.txt', 'default');

      const callArg = mockClient.request.mock.calls[0] as unknown[];
      const config = callArg[0] as Record<string, unknown>;
      expect(config.method).toBe('move');
      const headers = config.headers as Record<string, string>;
      expect(headers.Destination).toBeDefined();
      expect(headers.Overwrite).toBe('T');
    });
  });

  describe('copyFileViaWebDAV', () => {
    it('should call request with COPY method and Destination header', async () => {
      mockClient.request.mockResolvedValue({ status: 201, data: { status: 201 } });

      await service.copyFileViaWebDAV('testuser', '/Documents/original.txt', '/Documents/copy.txt', 'default');

      const callArg = mockClient.request.mock.calls[0] as unknown[];
      const config = callArg[0] as Record<string, unknown>;
      expect(config.method).toBe('copy');
      const headers = config.headers as Record<string, string>;
      expect(headers.Destination).toBeDefined();
    });
  });

  describe('safeJoinUrl', () => {
    it('should join base URL and path correctly', () => {
      const result = WebdavService.safeJoinUrl('https://webdav.example.com/', 'Documents/file.txt');
      expect(result).toContain('Documents');
    });

    it('should handle empty path', () => {
      const result = WebdavService.safeJoinUrl('https://webdav.example.com/', '');
      expect(result).toBe('https://webdav.example.com/');
    });

    it('should handle leading slashes in path', () => {
      const result = WebdavService.safeJoinUrl('https://webdav.example.com/', '///Documents///');
      expect(result).toContain('Documents');
    });

    it('should return base URL for invalid input', () => {
      const result = WebdavService.safeJoinUrl('not-a-url', '/path');
      expect(result).toBe('not-a-url');
    });
  });

  describe('getPathUntilFolder', () => {
    it('should return path up to and including folder name', () => {
      const result = service.getPathUntilFolder('/Documents/Work/Reports/file.txt', 'Work');
      expect(result).toBe('/Documents/Work');
    });

    it('should return full path when folder name not found', () => {
      const result = service.getPathUntilFolder('/Documents/Work/file.txt', 'Missing');
      expect(result).toBe('/Documents/Work/file.txt');
    });
  });

  describe('copyCollectedItems', () => {
    it('should copy to all destination paths', async () => {
      mockClient.request.mockResolvedValue({ status: 201, data: { status: 201 } });

      const result = await service.copyCollectedItems(
        'testuser',
        {
          originFilePath: '/source/file.txt',
          destinationFilePaths: ['/dest1/file.txt', '/dest2/file.txt'],
        },
        'default',
      );

      expect(result).toEqual({ success: true, status: HttpStatus.OK });
      expect(mockClient.request).toHaveBeenCalledTimes(2);
    });

    it('should throw when copy fails', async () => {
      mockClient.request.mockRejectedValue(new Error('Copy failed'));

      await expect(
        service.copyCollectedItems(
          'testuser',
          {
            originFilePath: '/source/file.txt',
            destinationFilePaths: ['/dest1/file.txt'],
          },
          'default',
        ),
      ).rejects.toMatchObject({
        message: FileSharingErrorMessage.SharingFailed,
      });
    });
  });

  describe('getFileTypeFromWebdavPath', () => {
    it('should return COLLECTION when matched file is a directory', async () => {
      jest
        .spyOn(service, 'getFilesAtPath')
        .mockResolvedValue([
          { filePath: '/Documents/', type: 'COLLECTION', filename: 'Documents', basename: 'Documents' } as never,
        ]);

      const result = await service.getFileTypeFromWebdavPath('testuser', '/Documents/', '/Documents/', 'default');

      expect(result).toBe('COLLECTION');
    });

    it('should return FILE when matched file is a file', async () => {
      jest
        .spyOn(service, 'getFilesAtPath')
        .mockResolvedValue([
          { filePath: '/Documents/test.txt', type: 'FILE', filename: 'test.txt', basename: 'test.txt' } as never,
        ]);

      const result = await service.getFileTypeFromWebdavPath(
        'testuser',
        '/Documents/',
        '/Documents/test.txt',
        'default',
      );

      expect(result).toBe('FILE');
    });
  });
});
