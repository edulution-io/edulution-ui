import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync, promises as fsPromises, readFileSync, writeFileSync } from 'fs';
import { dirname, extname, join, resolve } from 'path';
import { createHash } from 'crypto';
import { pipeline, Readable } from 'stream';
import { promisify } from 'util';
import HashAlgorithm from '@libs/common/contants/hashAlgorithm';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosResponse } from 'axios';
import getProtocol from '@libs/common/utils/getProtocol';
import { ResponseType } from '@libs/common/types/http-methods';
import { firstValueFrom } from 'rxjs';
import CustomHttpException from '@libs/error/CustomHttpException';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import OnlyOfficeCallbackData from '@libs/filesharing/types/onlyOfficeCallBackData';
import CustomFile from '@libs/filesharing/types/customFile';
import { WebdavStatusReplay } from '@libs/filesharing/types/fileOperationResult';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import process from 'node:process';
import outputFolder from '@libs/filesharing/utils/outputFolder';
import UsersService from '../users/users.service';

const pipelineAsync = promisify(pipeline);

@Injectable()
class FilesystemService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UsersService,
  ) {}

  private readonly baseurl = process.env.EDUI_WEBDAV_URL as string;

  async fetchFileStream(
    username: string,
    url: string,
    streamFetching = false,
  ): Promise<AxiosResponse<Readable> | Readable> {
    try {
      const password = await this.userService.getPassword(username);
      const authContents = `${username}:${password}`;
      const protocol = getProtocol(url);
      const authenticatedUrl = url.replace(/^https?:\/\//, `${protocol}://${authContents}@`);

      const fileStream = this.httpService.get<Readable>(authenticatedUrl, {
        responseType: ResponseType.STREAM,
      });

      return await firstValueFrom(fileStream).then((res) => (streamFetching ? res : res.data));
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.DownloadFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
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
      const filePath = join(`${outputFolder}/${filename}`);
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
    const filePath = resolve(outputFolder, fileName);
    try {
      await fsPromises.unlink(filePath);
      Logger.log(`File deleted at ${filePath}`);
    } catch (error) {
      console.error(`Error deleting file at ${filePath}:`, error);
      throw new CustomHttpException(FileSharingErrorMessage.DeleteFromServerFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fileLocation(username: string, filePath: string, filename: string): Promise<WebdavStatusReplay> {
    const url = `${this.baseurl}${getPathWithoutWebdav(filePath)}`;
    FilesystemService.ensureDirectoryExists(outputFolder);

    try {
      const user = await this.userService.findOne(username);
      if (!user) {
        return { success: false, status: HttpStatus.NOT_FOUND } as WebdavStatusReplay;
      }
      const responseStream = await this.fetchFileStream(user?.username, `${url}`);
      const hashedFilename = FilesystemService.generateHashedFilename(filePath, filename);
      const outputFilePath = FilesystemService.getOutputFilePath(outputFolder, hashedFilename);

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
