import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync, promises as fsPromises, readFileSync, writeFileSync } from 'fs';
import { dirname, extname, join, resolve } from 'path';
import { createHash } from 'crypto';
import { pipeline, Readable } from 'stream';
import { promisify } from 'util';
import HashAlgorithm from '@libs/common/constants/hashAlgorithm';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ResponseType } from '@libs/common/types/http-methods';
import { firstValueFrom, from } from 'rxjs';
import CustomHttpException from '@libs/error/CustomHttpException';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import OnlyOfficeCallbackData from '@libs/filesharing/types/onlyOfficeCallBackData';
import CustomFile from '@libs/filesharing/types/customFile';
import { WebdavStatusReplay } from '@libs/filesharing/types/fileOperationResult';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import process from 'node:process';
import PUBLIC_DOWNLOADS_PATH from '@libs/common/constants/publicDownloadsPath';
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

  static ensureDirectoryExists(directory: string): void {
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
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

  static async retrieveAndSaveFile(filename: string, body: OnlyOfficeCallbackData): Promise<CustomFile | undefined> {
    if ((body.status !== 2 && body.status !== 4) || !body.url) {
      return undefined;
    }

    try {
      const response = await axios.get<ArrayBuffer>(body.url, { responseType: 'arraybuffer' });
      const filePath = join(`${PUBLIC_DOWNLOADS_PATH}/${filename}`);
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, new Uint8Array(response.data));
      const fileBuffer = readFileSync(filePath);
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
      throw new CustomHttpException(FileSharingErrorMessage.SaveFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  static async deleteFile(fileName: string): Promise<void> {
    const filePath = resolve(PUBLIC_DOWNLOADS_PATH, fileName);
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
  ): Promise<WebdavStatusReplay> {
    const url = `${this.baseurl}${getPathWithoutWebdav(filePath)}`;
    FilesystemService.ensureDirectoryExists(PUBLIC_DOWNLOADS_PATH);

    try {
      const user = await this.userService.findOne(username);
      if (!user) {
        return { success: false, status: HttpStatus.NOT_FOUND } as WebdavStatusReplay;
      }
      const responseStream = await FilesystemService.fetchFileStream(url, client);
      const hashedFilename = FilesystemService.generateHashedFilename(filePath, filename);
      const outputFilePath = FilesystemService.getOutputFilePath(PUBLIC_DOWNLOADS_PATH, hashedFilename);

      await FilesystemService.saveFileStream(responseStream, outputFilePath);
      return {
        success: true,
        status: HttpStatus.OK,
        data: hashedFilename,
      } as WebdavStatusReplay;
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.DownloadFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }
}

export default FilesystemService;
