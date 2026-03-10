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

/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import ThumbnailService from './thumbnail.service';
import WebdavService from '../webdav/webdav.service';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';
import FilesystemService from '../filesystem/filesystem.service';

jest.mock('sharp', () => {
  const mockSharp = jest.fn().mockReturnValue({
    resize: jest.fn().mockReturnValue({
      webp: jest.fn().mockReturnValue({
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('thumbnail-data')),
      }),
    }),
    toFile: jest.fn().mockResolvedValue(undefined),
  });
  return mockSharp;
});

jest.mock('fs-extra', () => ({
  pathExists: jest.fn().mockResolvedValue(false),
  readdir: jest.fn().mockResolvedValue([]),
  stat: jest.fn().mockResolvedValue({ size: 100, mtimeMs: Date.now() }),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

describe(ThumbnailService.name, () => {
  let service: ThumbnailService;
  let webdavService: Record<string, jest.Mock>;
  let webdavSharesService: Record<string, jest.Mock>;

  beforeEach(async () => {
    webdavService = {
      getClient: jest.fn().mockResolvedValue({}),
    };

    webdavSharesService = {
      getWebdavShareFromCache: jest.fn().mockResolvedValue({
        pathname: '/webdav',
        url: 'https://webdav.example.com/webdav',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThumbnailService,
        { provide: WebdavService, useValue: webdavService },
        { provide: WebdavSharesService, useValue: webdavSharesService },
      ],
    }).compile();

    service = module.get<ThumbnailService>(ThumbnailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should ensure thumbnail cache directory exists', async () => {
      jest.spyOn(FilesystemService, 'ensureDirectoryExists').mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(FilesystemService.ensureDirectoryExists).toHaveBeenCalled();
    });

    it('should not throw when directory creation fails', async () => {
      jest.spyOn(FilesystemService, 'ensureDirectoryExists').mockRejectedValue(new Error('permission denied'));

      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('getThumbnail', () => {
    it('should return cached thumbnail when available', async () => {
      const cachedBuffer = Buffer.from('cached-thumb');
      const { pathExists } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(true);
      jest.spyOn(FilesystemService, 'readFile').mockResolvedValue(cachedBuffer);

      const result = await service.getThumbnail('teacher', '/images/photo.jpg', 'etag-123', 'default');

      expect(result).toBe(cachedBuffer);
      expect(webdavService.getClient).not.toHaveBeenCalled();
    });

    it('should generate thumbnail when not cached', async () => {
      const { pathExists } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(false);

      const mockStream = new Readable({
        read() {
          this.push(Buffer.from('image-data'));
          this.push(null);
        },
      });

      jest.spyOn(FilesystemService, 'fetchFileStream').mockResolvedValue(mockStream as never);
      jest.spyOn(WebdavService, 'safeJoinUrl').mockReturnValue('https://webdav.example.com/images/photo.jpg');

      const result = await service.getThumbnail('teacher', '/images/photo.jpg', 'etag-123', 'default');

      expect(result).toEqual(Buffer.from('thumbnail-data'));
      expect(webdavService.getClient).toHaveBeenCalledWith('teacher', 'default');
    });

    it('should throw with DownloadFailed when thumbnail generation fails', async () => {
      const { pathExists } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(false);

      webdavService.getClient.mockRejectedValue(new Error('connection failed'));

      await expect(service.getThumbnail('teacher', '/images/photo.jpg', 'etag-123', 'default')).rejects.toMatchObject({
        status: 500,
        message: FileSharingErrorMessage.DownloadFailed,
      });
    });

    it('should fall back to generation when cached read fails', async () => {
      const { pathExists } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(true);
      jest.spyOn(FilesystemService, 'readFile').mockRejectedValue(new Error('read error'));

      const mockStream = new Readable({
        read() {
          this.push(Buffer.from('image-data'));
          this.push(null);
        },
      });
      jest.spyOn(FilesystemService, 'fetchFileStream').mockResolvedValue(mockStream as never);
      jest.spyOn(WebdavService, 'safeJoinUrl').mockReturnValue('https://webdav.example.com/images/photo.jpg');

      const result = await service.getThumbnail('teacher', '/images/photo.jpg', 'etag-123', 'default');

      expect(result).toEqual(Buffer.from('thumbnail-data'));
      expect(webdavService.getClient).toHaveBeenCalled();
    });

    it('should handle response with data property instead of Readable', async () => {
      const { pathExists } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(false);

      const mockStream = new Readable({
        read() {
          this.push(Buffer.from('image-data'));
          this.push(null);
        },
      });
      jest.spyOn(FilesystemService, 'fetchFileStream').mockResolvedValue({ data: mockStream } as never);
      jest.spyOn(WebdavService, 'safeJoinUrl').mockReturnValue('https://webdav.example.com/images/photo.jpg');

      const result = await service.getThumbnail('teacher', '/images/photo.jpg', 'etag-123', 'default');

      expect(result).toEqual(Buffer.from('thumbnail-data'));
    });
  });

  describe('handleCacheCleanup', () => {
    it('should not throw during cleanup', async () => {
      const { pathExists } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(false);

      await expect(service.handleCacheCleanup()).resolves.not.toThrow();
    });

    it('should delete oldest files when cache exceeds max size', async () => {
      const { pathExists, readdir, stat, unlink } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(true);
      readdir.mockResolvedValue(['old.webp', 'new.webp']);
      stat
        .mockResolvedValueOnce({ size: 300 * 1024 * 1024, mtimeMs: 1000 })
        .mockResolvedValueOnce({ size: 300 * 1024 * 1024, mtimeMs: 2000 });
      unlink.mockResolvedValue(undefined);

      await service.handleCacheCleanup();

      expect(unlink).toHaveBeenCalled();
    });

    it('should not delete files when cache is within limit', async () => {
      const { pathExists, readdir, stat, unlink } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(true);
      readdir.mockResolvedValue(['small.webp']);
      stat.mockResolvedValue({ size: 100, mtimeMs: Date.now() });

      await service.handleCacheCleanup();

      expect(unlink).not.toHaveBeenCalled();
    });

    it('should handle empty cache directory', async () => {
      const { pathExists, readdir, unlink } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(true);
      readdir.mockResolvedValue([]);

      await service.handleCacheCleanup();

      expect(unlink).not.toHaveBeenCalled();
    });

    it('should delete oldest files first when cache exceeds limit', async () => {
      const { pathExists, readdir, stat, unlink } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(true);
      readdir.mockResolvedValue(['newest.webp', 'oldest.webp', 'middle.webp']);
      stat
        .mockResolvedValueOnce({ size: 200 * 1024 * 1024, mtimeMs: 3000 })
        .mockResolvedValueOnce({ size: 200 * 1024 * 1024, mtimeMs: 1000 })
        .mockResolvedValueOnce({ size: 200 * 1024 * 1024, mtimeMs: 2000 });
      unlink.mockResolvedValue(undefined);

      await service.handleCacheCleanup();

      const unlinkCalls = unlink.mock.calls.map((call: string[]) => call[0]);
      const oldestIndex = unlinkCalls.findIndex((p: string) => p.includes('oldest'));
      const newestIndex = unlinkCalls.findIndex((p: string) => p.includes('newest'));
      expect(oldestIndex).toBeLessThan(newestIndex === -1 ? Infinity : newestIndex);
    });

    it('should not throw when readdir fails', async () => {
      const { pathExists, readdir } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(true);
      readdir.mockRejectedValue(new Error('permission denied'));

      await expect(service.handleCacheCleanup()).resolves.not.toThrow();
    });

    it('should handle partial unlink failures gracefully', async () => {
      const { pathExists, readdir, stat, unlink } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(true);
      readdir.mockResolvedValue(['a.webp', 'b.webp']);
      stat
        .mockResolvedValueOnce({ size: 300 * 1024 * 1024, mtimeMs: 1000 })
        .mockResolvedValueOnce({ size: 300 * 1024 * 1024, mtimeMs: 2000 });
      unlink.mockRejectedValueOnce(new Error('busy')).mockResolvedValueOnce(undefined);

      await expect(service.handleCacheCleanup()).resolves.not.toThrow();
    });
  });
});
