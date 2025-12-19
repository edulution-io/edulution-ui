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

import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { createHash } from 'crypto';
import { ensureDir, pathExists, readdir, stat, unlink } from 'fs-extra';
import { join } from 'path';
import { Readable } from 'stream';
import sharp from 'sharp';
import THUMBNAIL_CONFIG from '@libs/filesharing/constants/thumbnailConfig';
import THUMBNAIL_CACHE_PATH from '@libs/filesharing/constants/thumbnailCachePath';
import HashAlgorithm from '@libs/common/constants/hashAlgorithm';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import WebdavService from '../webdav/webdav.service';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';
import FilesystemService from '../filesystem/filesystem.service';
import CustomHttpException from '../common/CustomHttpException';

interface FileStatInfo {
  path: string;
  size: number;
  mtime: number;
}

@Injectable()
class ThumbnailService implements OnModuleInit {
  constructor(
    private readonly webdavService: WebdavService,
    private readonly webdavSharesService: WebdavSharesService,
  ) {}

  async onModuleInit(): Promise<void> {
    await ThumbnailService.ensureCacheDirectory();
  }

  @Cron('0 30 3 * * *', {
    name: 'CleanupThumbnailCache',
    timeZone: 'UTC',
  })
  async handleCacheCleanup(): Promise<void> {
    Logger.debug('CronJob: CleanupThumbnailCache (running once every morning at 03:30 UTC)', ThumbnailService.name);
    await ThumbnailService.enforceMaxCacheSize();
  }

  private static async ensureCacheDirectory(): Promise<void> {
    try {
      await ensureDir(THUMBNAIL_CACHE_PATH);
      Logger.debug(`Thumbnail cache directory ensured at: ${THUMBNAIL_CACHE_PATH}`, ThumbnailService.name);
    } catch (error) {
      Logger.error(`Failed to create thumbnail cache directory: ${error}`, ThumbnailService.name);
    }
  }

  private static generateCacheKey(filePath: string, etag: string): string {
    const input = `${filePath}:${etag}:${THUMBNAIL_CONFIG.SIZE}`;
    return createHash(HashAlgorithm).update(input).digest('hex');
  }

  private static getCachePath(cacheKey: string): string {
    return join(THUMBNAIL_CACHE_PATH, `${cacheKey}.${THUMBNAIL_CONFIG.FORMAT}`);
  }

  async getThumbnail(username: string, filePath: string, etag: string, share: string): Promise<Buffer> {
    const cacheKey = ThumbnailService.generateCacheKey(filePath, etag);
    const cachePath = ThumbnailService.getCachePath(cacheKey);

    const cached = await ThumbnailService.getCachedThumbnail(cachePath);
    if (cached) {
      return cached;
    }

    return this.generateAndCacheThumbnail(username, filePath, share, cachePath);
  }

  private static async getCachedThumbnail(cachePath: string): Promise<Buffer | null> {
    try {
      const exists = await pathExists(cachePath);
      if (exists) {
        return await FilesystemService.readFile(cachePath);
      }
    } catch (error) {
      Logger.warn(`Failed to read cached thumbnail: ${error}`, ThumbnailService.name);
    }
    return null;
  }

  private async generateAndCacheThumbnail(
    username: string,
    filePath: string,
    share: string,
    cachePath: string,
  ): Promise<Buffer> {
    try {
      const client = await this.webdavService.getClient(username, share);
      const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);
      const pathWithoutWebdav = getPathWithoutWebdav(filePath, webdavShare.pathname);
      const url = WebdavService.safeJoinUrl(webdavShare.url, pathWithoutWebdav);

      const response = await FilesystemService.fetchFileStream(url, client);
      const stream = response instanceof Readable ? response : response.data;

      const thumbnail = await ThumbnailService.generateThumbnail(stream);

      await ThumbnailService.saveThumbnailToCache(thumbnail, cachePath);

      return thumbnail;
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.DownloadFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to generate thumbnail for ${filePath}: ${error}`,
        ThumbnailService.name,
      );
    }
  }

  private static async generateThumbnail(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const imageBuffer = Buffer.concat(chunks);

    return sharp(imageBuffer)
      .resize(THUMBNAIL_CONFIG.SIZE, THUMBNAIL_CONFIG.SIZE, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: THUMBNAIL_CONFIG.QUALITY })
      .toBuffer();
  }

  private static async saveThumbnailToCache(thumbnail: Buffer, cachePath: string): Promise<void> {
    try {
      await sharp(thumbnail).toFile(cachePath);
      Logger.debug(`Thumbnail cached at: ${cachePath}`, ThumbnailService.name);
    } catch (error) {
      Logger.warn(`Failed to cache thumbnail: ${error}`, ThumbnailService.name);
    }
  }

  private static async enforceMaxCacheSize(): Promise<void> {
    try {
      const exists = await pathExists(THUMBNAIL_CACHE_PATH);
      if (!exists) {
        return;
      }

      const files = await readdir(THUMBNAIL_CACHE_PATH);
      const fileStats = await Promise.all(
        files.map(async (filename): Promise<FileStatInfo> => {
          const filePath = join(THUMBNAIL_CACHE_PATH, filename);
          const stats = await stat(filePath);
          return {
            path: filePath,
            size: stats.size,
            mtime: stats.mtimeMs,
          };
        }),
      );

      const totalSizeBytes = fileStats.reduce((acc, f) => acc + f.size, 0);
      const maxSizeBytes = THUMBNAIL_CONFIG.MAX_CACHE_SIZE_MB * 1024 * 1024;

      if (totalSizeBytes <= maxSizeBytes) {
        Logger.debug(
          `Cache size ${(totalSizeBytes / 1024 / 1024).toFixed(2)}MB is within limit`,
          ThumbnailService.name,
        );
        return;
      }

      fileStats.sort((a, b) => a.mtime - b.mtime);

      const targetSize = maxSizeBytes * 0.8;
      const filesToDelete = ThumbnailService.selectFilesToDelete(fileStats, totalSizeBytes, targetSize);

      const deleteResults = await Promise.allSettled(filesToDelete.map((file) => unlink(file.path)));

      const deletedCount = deleteResults.filter((r) => r.status === 'fulfilled').length;
      const freedBytes = filesToDelete.reduce((acc, f) => acc + f.size, 0);

      Logger.log(
        `Cleaned up ${deletedCount} cached thumbnails, freed ${(freedBytes / 1024 / 1024).toFixed(2)}MB`,
        ThumbnailService.name,
      );
    } catch (error) {
      Logger.error(`Failed to enforce cache size limit: ${error}`, ThumbnailService.name);
    }
  }

  private static selectFilesToDelete(
    sortedFiles: FileStatInfo[],
    totalSize: number,
    targetSize: number,
  ): FileStatInfo[] {
    const filesToDelete: FileStatInfo[] = [];
    let currentSize = totalSize;

    sortedFiles.every((file) => {
      if (currentSize <= targetSize) {
        return false;
      }
      filesToDelete.push(file);
      currentSize -= file.size;
      return true;
    });

    return filesToDelete;
  }
}

export default ThumbnailService;
