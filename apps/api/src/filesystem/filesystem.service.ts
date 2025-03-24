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
    try {
      await fsPromises.access(directory);
      await fsPromises.mkdir(directory, { recursive: true });
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DIRECTORY_CREATION_FAILED, HttpStatus.NOT_FOUND);
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
        throw new CustomHttpException(CommonErrorMessages.DIRECTORY_CREATION_FAILED, HttpStatus.NOT_FOUND);
      }

      try {
        await fsPromises.writeFile(filePath, new Uint8Array(response.data));
      } catch (error) {
        throw new CustomHttpException(CommonErrorMessages.FILE_WRITING_FAILED, HttpStatus.NOT_FOUND);
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

  static async deleteFile(fileName: string): Promise<void> {
    const filePath = join(PUBLIC_DOWNLOADS_PATH, fileName);
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
        return { success: false, status: HttpStatus.NOT_FOUND } as WebdavStatusResponse;
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

  static async checkIfFileExist(filePath: string) {
    try {
      await fsPromises.access(filePath);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }

  static async checkIfFileExistAndDelete(filePath: string) {
    await FilesystemService.checkIfFileExist(filePath);
    try {
      await fsPromises.unlink(filePath);
      Logger.log(`${filePath} deleted.`, FilesystemService.name);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_DELETION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteDirectories(directories: string[]): Promise<void> {
    try {
      const deletionPromises = directories.map((directory) => fsPromises.rmdir(directory, { recursive: true }));
      await Promise.all(deletionPromises);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_DELETION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createReadStream(filePath: string): Promise<Readable> {
    try {
      await fsPromises.access(filePath);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return createReadStream(filePath);
  }
}

export default FilesystemService;
