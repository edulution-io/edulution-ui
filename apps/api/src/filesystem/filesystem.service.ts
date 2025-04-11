/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/* eslint-disable @typescript-eslint/class-methods-use-this */
import { createWriteStream, createReadStream, promises as fsPromises } from 'fs';
import process from 'node:process';
import { promisify } from 'util';
import { createHash } from 'crypto';
import { firstValueFrom, from } from 'rxjs';
import { dirname, extname, join } from 'path';
import { pipeline, Readable } from 'stream';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ResponseType } from '@libs/common/types/http-methods';
import HashAlgorithm from '@libs/common/constants/hashAlgorithm';
import CustomFile from '@libs/filesharing/types/customFile';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import PUBLIC_DOWNLOADS_PATH from '@libs/common/constants/publicDownloadsPath';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import { WebdavStatusResponse } from '@libs/filesharing/types/fileOperationResult';
import type FileInfoDto from '@libs/appconfig/types/fileInfo.dto';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';
import UsersService from '../users/users.service';

const pipelineAsync = promisify(pipeline);

@Injectable()
class FilesystemService {
  constructor(private readonly userService: UsersService) {}

  private readonly baseurl = process.env.EDUI_WEBDAV_URL as string;

  static async fetchFileStream(
    url: string,
    client: AxiosInstance,
    streamFetching = false,
  ): Promise<AxiosResponse<Readable> | Readable> {
    try {
      const fileStream = from(client.get<Readable>(url, { responseType: ResponseType.STREAM }));
      return await firstValueFrom(fileStream).then((res) => (streamFetching ? res : res.data));
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.DownloadFailed, HttpStatus.INTERNAL_SERVER_ERROR, url);
    }
  }

  async ensureDirectoryExists(directory: string): Promise<void> {
    const exists = await FilesystemService.checkIfFileExist(directory);
    if (!exists) {
      try {
        await fsPromises.mkdir(directory, { recursive: true });
      } catch (error) {
        throw new CustomHttpException(CommonErrorMessages.DIRECTORY_CREATION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
      }
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
    await pipelineAsync(actualStream as Readable, writeStream);
  }

  static getOutputFilePath(directory: string, hashedFilename: string): string {
    return join(directory, hashedFilename);
  }

  static async retrieveAndSaveFile(filename: string, url: string): Promise<CustomFile | undefined> {
    if (!url) {
      throw new CustomHttpException(FileSharingErrorMessage.MissingCallbackURL, HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
      const filePath = join(PUBLIC_DOWNLOADS_PATH, filename);

      try {
        await fsPromises.mkdir(dirname(filePath), { recursive: true });
      } catch (error) {
        throw new CustomHttpException(CommonErrorMessages.DIRECTORY_CREATION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      try {
        await fsPromises.writeFile(filePath, new Uint8Array(response.data));
      } catch (error) {
        throw new CustomHttpException(CommonErrorMessages.FILE_WRITING_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const fileBuffer = await fsPromises.readFile(filePath);
      const mimetype: string = (response.headers['content-type'] as string) || 'application/octet-stream';

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
      await fsPromises.unlink(filePath);
      Logger.log(`File deleted at ${filePath}`);
    } catch (error) {
      throw new CustomHttpException(
        FileSharingErrorMessage.DeleteFromServerFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        filePath,
      );
    }
  }

  async fileLocation(
    username: string,
    filePath: string,
    filename: string,
    client: AxiosInstance,
  ): Promise<WebdavStatusResponse> {
    const url = `${this.baseurl}${getPathWithoutWebdav(filePath)}`;
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

  static async checkIfFileExist(filePath: string): Promise<boolean> {
    try {
      await fsPromises.access(filePath);
    } catch (error) {
      return false;
    }
    return true;
  }

  static async throwErrorIfFileNotExists(filePath: string): Promise<void> {
    try {
      await fsPromises.access(filePath);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  static async checkIfFileExistAndDelete(filePath: string) {
    await FilesystemService.throwErrorIfFileNotExists(filePath);
    try {
      await fsPromises.unlink(filePath);
      Logger.log(`${filePath} deleted.`, FilesystemService.name);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_DELETION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteDirectories(directories: string[]): Promise<void> {
    try {
      const deletionPromises = directories.map((directory) => fsPromises.rm(directory, { recursive: true }));
      await Promise.all(deletionPromises);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_DELETION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createReadStream(filePath: string): Promise<Readable> {
    try {
      await fsPromises.access(filePath);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return createReadStream(filePath);
  }

  async getFilesInfo(path: string): Promise<FileInfoDto[]> {
    try {
      const folderPath = `${APPS_FILES_PATH}/${path}`;
      const files = await fsPromises.readdir(folderPath);

      const fileDataPromises = files.map(async (fileName) => {
        const filePath = join(folderPath, fileName);
        const stat = await fsPromises.stat(filePath);

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
}

export default FilesystemService;
