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

/* eslint-disable @typescript-eslint/class-methods-use-this */
import {
  access,
  createReadStream,
  createWriteStream,
  ensureDir,
  move,
  outputFile,
  pathExists,
  readdir,
  readFile,
  rm,
  remove,
  stat as fsStat,
  unlink,
} from 'fs-extra';
import { createHash } from 'crypto';
import { firstValueFrom, from } from 'rxjs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { extname, join, dirname } from 'path';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { lookup } from 'mime-types';
import { type Response } from 'express';
import { HTTP_HEADERS, RequestResponseContentType, ResponseType } from '@libs/common/types/http-methods';
import HashAlgorithm from '@libs/common/constants/hashAlgorithm';
import CustomFile from '@libs/filesharing/types/customFile';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import PUBLIC_DOWNLOADS_PATH from '@libs/common/constants/publicDownloadsPath';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import { WebdavStatusResponse } from '@libs/filesharing/types/fileOperationResult';
import type FileInfoDto from '@libs/appconfig/types/fileInfo.dto';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';
import TEMP_FILES_PATH from '@libs/filesystem/constants/tempFilesPath';
import THIRTY_DAYS from '@libs/common/constants/thirtyDays';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';
import UsersService from '../users/users.service';
import CustomHttpException from '../common/CustomHttpException';

@Injectable()
class FilesystemService {
  constructor(
    private readonly userService: UsersService,
    private readonly webdavSharesService: WebdavSharesService,
  ) {}

  @Cron('0 0 4 * * *', {
    name: 'ClearTempFiles',
    timeZone: 'UTC',
  })
  async handleCron() {
    Logger.debug('CronJob: ClearTempFiles (running once every morning at 04:00 UTC)');
    await this.removeOldTempFiles(TEMP_FILES_PATH);
  }

  static async fetchFileStream(
    url: string,
    client: AxiosInstance,
    isStreamFetching = false,
    onProgress?: (percent: string) => void,
  ): Promise<AxiosResponse<Readable> | Readable> {
    try {
      const response = await firstValueFrom(from(client.get<Readable>(url, { responseType: ResponseType.STREAM })));

      const contentLengthHeader = response.headers?.[HTTP_HEADERS.ContentLength] as string | undefined;

      const contentLength = contentLengthHeader && /^\d+$/.test(contentLengthHeader) ? Number(contentLengthHeader) : 0;

      const readStream = response.data;

      if (contentLength > 0) {
        let downloadedBytes = 0;
        readStream.on('data', (chunk: Buffer) => {
          downloadedBytes += chunk.length;
          const percent = ((downloadedBytes / contentLength) * 100).toFixed(2);
          if (onProgress) onProgress(percent);
        });
      }

      return isStreamFetching ? response : readStream;
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.DownloadFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        url,
        FilesystemService.name,
      );
    }
  }

  static async readFile(filePath: string): Promise<Buffer> {
    try {
      return await readFile(filePath);
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.DownloadFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        filePath,
        FilesystemService.name,
      );
    }
  }

  static async moveFile(oldFilePath: string, newFilePath: string): Promise<void> {
    try {
      await move(oldFilePath, newFilePath, { overwrite: true });
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.MoveFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        FilesystemService.name,
      );
    }
  }

  static generateHashedFilename(filePath: string, filename: string): string {
    const hash = createHash(HashAlgorithm).update(filePath).digest('hex');
    const extension = extname(filename);
    return `${hash}${extension}`;
  }

  static async saveFileStream(stream: AxiosResponse<Readable> | Readable, outputPath: string): Promise<void> {
    const writeStream = createWriteStream(outputPath);
    const actualStream = (stream as AxiosResponse<Readable>).data ? (stream as AxiosResponse<Readable>).data : stream;
    await pipeline(actualStream as Readable, writeStream);
  }

  static getOutputFilePath(directory: string, hashedFilename: string): string {
    return join(directory, hashedFilename);
  }

  static async retrieveAndSaveFile(filename: string, url: string): Promise<CustomFile | undefined> {
    if (!url) {
      throw new CustomHttpException(FileSharingErrorMessage.MissingCallbackURL, HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await axios.get<ArrayBuffer>(url, { responseType: ResponseType.ARRAYBUFFER });
      const filePath = join(PUBLIC_DOWNLOADS_PATH, filename);

      await outputFile(filePath, new Uint8Array(response.data));

      const fileBuffer = await readFile(filePath);
      const mimetype: string =
        (response.headers[HTTP_HEADERS.ContentType] as string) || RequestResponseContentType.APPLICATION_OCTET_STREAM;

      return {
        fieldname: 'file',
        originalname: filename,
        encoding: '7bit',
        mimetype,
        buffer: fileBuffer,
        size: fileBuffer.length,
      } as CustomFile;
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.SaveFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        filename,
        FilesystemService.name,
      );
    }
  }

  static async deleteFile(path: string, fileName: string): Promise<void> {
    const filePath = join(path, fileName);
    try {
      await unlink(filePath);
      Logger.log(`File deleted at ${filePath}`);
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.DeleteFromServerFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        filePath,
      );
    }
  }

  static async deleteFiles(path: string, fileNames: string[]): Promise<void> {
    await Promise.all(fileNames.map((fileName) => FilesystemService.deleteFile(path, fileName)));
  }

  static async checkIfFileExist(filePath: string): Promise<boolean> {
    return pathExists(filePath);
  }

  static async throwErrorIfFileNotExists(filePath: string): Promise<void> {
    try {
      await access(filePath);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  static async checkIfFileExistAndDelete(filePath: string) {
    try {
      const exists = await pathExists(filePath);
      if (exists) {
        await unlink(filePath);
        Logger.log(`${filePath} deleted.`, FilesystemService.name);
      }
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_DELETION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  static async writeFile(filePath: string, content: string) {
    try {
      await outputFile(filePath, content);
      Logger.log(`${filePath} created.`, FilesystemService.name);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_PROVIDED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteDirectory(directory: string): Promise<void> {
    try {
      const exists = await pathExists(directory);
      if (exists) {
        await rm(directory, { recursive: true });
      }
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_DELETION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  static async deleteDirectories(directories: string[]): Promise<void> {
    try {
      const deletionPromises = directories.map(async (directory) => {
        const exists = await pathExists(directory);
        if (exists) {
          await rm(directory, { recursive: true });
        }
      });
      await Promise.all(deletionPromises);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_DELETION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  static buildPathString(path: string | string[]) {
    if (Array.isArray(path)) {
      return join(...path);
    }
    return path;
  }

  async ensureDirectoryExists(directory: string): Promise<void> {
    try {
      await ensureDir(directory);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DIRECTORY_CREATION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fileLocation(
    username: string,
    filePath: string,
    filename: string,
    client: AxiosInstance,
    share: string,
  ): Promise<WebdavStatusResponse> {
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(share);
    const url = `${webdavShare.url}${getPathWithoutWebdav(filePath, webdavShare.pathname)}`;
    await this.ensureDirectoryExists(PUBLIC_DOWNLOADS_PATH);

    try {
      const user = await this.userService.findOne(username);
      if (!user) {
        return { success: false, status: HttpStatus.INTERNAL_SERVER_ERROR } as WebdavStatusResponse;
      }
      const responseStream = await FilesystemService.fetchFileStream(url, client);
      const hashedFilename = FilesystemService.generateHashedFilename(filePath, filename);
      const outputFilePath = FilesystemService.getOutputFilePath(PUBLIC_DOWNLOADS_PATH, hashedFilename);

      await FilesystemService.saveFileStream(responseStream, outputFilePath);
      return {
        success: true,
        status: HttpStatus.OK,
        data: hashedFilename,
      } as WebdavStatusResponse;
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.DownloadFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async getAllFilenamesInDirectory(directory: string): Promise<string[]> {
    const exists = await pathExists(directory);
    if (!exists) {
      return [];
    }
    return readdir(directory);
  }

  async deleteEmptyFolder(directory: string): Promise<void> {
    const exists = await pathExists(directory);
    if (!exists) {
      return;
    }
    const filesNames = await readdir(directory);
    if (filesNames.length === 0) {
      await remove(directory);
    }
  }

  async deleteFolderAndParentsUpToDepth(folderPath: string, deep: number): Promise<void> {
    if (deep < 0) return;

    const exists = await pathExists(folderPath);
    if (!exists) return;

    const files = await readdir(folderPath);

    if (files.length === 0) {
      await remove(folderPath);

      if (deep > 0) {
        const parentPath = dirname(folderPath);
        if (parentPath !== folderPath) {
          await this.deleteFolderAndParentsUpToDepth(parentPath, deep - 1);
        }
      }
    }
  }

  async createReadStream(filePath: string): Promise<Readable> {
    try {
      await FilesystemService.throwErrorIfFileNotExists(filePath);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return createReadStream(filePath);
  }

  async getFilesInfo(path: string): Promise<FileInfoDto[]> {
    try {
      const folderPath = `${APPS_FILES_PATH}/${path}`;
      const files = await readdir(folderPath);

      const fileDataPromises = files.map(async (fileName) => {
        const filePath = join(folderPath, fileName);
        const stat = await fsStat(filePath);

        let type: string;
        if (stat.isFile()) {
          type = extname(fileName).toLowerCase().split('.').pop() || 'file';
        } else if (stat.isDirectory()) {
          type = 'directory';
        } else {
          type = 'other';
        }

        return {
          filename: fileName,
          size: stat.size,
          type,
          lastModified: stat.mtime.toISOString(),
        };
      });

      return await Promise.all(fileDataPromises);
    } catch (error) {
      return [];
    }
  }

  async serveTempFiles(name: string, filename: string, res: Response) {
    const filePath = join(TEMP_FILES_PATH, name, filename);
    return this.serve(filePath, res);
  }

  async serveFiles(name: string, filename: string, res: Response) {
    const filePath = join(APPS_FILES_PATH, name, filename);
    return this.serve(filePath, res);
  }

  async serve(filePath: string, res: Response) {
    await FilesystemService.throwErrorIfFileNotExists(filePath);

    const contentType = lookup(filePath) || RequestResponseContentType.APPLICATION_OCTET_STREAM;
    res.setHeader(HTTP_HEADERS.ContentType, contentType);

    const fileStream = await this.createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }

  async removeOldTempFiles(path: string, currentTimeMs?: number): Promise<void> {
    if (!path) {
      return;
    }
    try {
      const stat = await fsStat(path);
      const now = currentTimeMs || Date.now();

      if (stat.isFile()) {
        if (stat.mtimeMs < now - THIRTY_DAYS) {
          await unlink(path);
          Logger.log(`Deleted old temp file: ${path}`);
          return;
        }
      }

      if (stat.isDirectory()) {
        const files = await readdir(path);
        const promises = files.map((fileName) => {
          const newPath = join(path, fileName);
          return this.removeOldTempFiles(newPath, now);
        });
        await Promise.all(promises);

        if (path !== TEMP_FILES_PATH) {
          const remainingFiles = await readdir(path);
          if (remainingFiles.length === 0) {
            Logger.log(`Deleting empty temporary directory: ${path}`);
            await rm(path, { recursive: true });
          }
        }
      }
    } catch (error) {
      Logger.error(`Error removing old temp files: ${error}`);
    }
  }
}

export default FilesystemService;
