import { AES, enc } from 'crypto-js';
import CustomHttpException from '@libs/error/CustomHttpException';
import FileSharingErrorMessage from '@libs/filesharing/fileSharingErrorMessage';
import { HttpStatus } from '@nestjs/common';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';
import UsersService from '../users/users.service';
import { User } from '../users/user.schema';

class EduApiUtility {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordEncryptionKey: string,
  ) {}

  static decryptPassword(encryptedPassword: string, encryptionKey: string): string {
    const decrypted = AES.decrypt(encryptedPassword, encryptionKey).toString(enc.Utf8);
    if (!decrypted) {
      throw new CustomHttpException(FileSharingErrorMessage.DbAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: 'Failed to decrypt password',
      });
    }
    return decrypted;
  }

  async ensureValidUser(username: string): Promise<User> {
    const user = await this.usersService.findOne(username);
    if (!user || !user.password) {
      throw new CustomHttpException(FileSharingErrorMessage.DbAccessFailed, HttpStatus.NOT_FOUND, {
        message: 'User not found or password missing',
      });
    }
    return user;
  }

  static async saveFileStream(fileStream: any, outputPath: string): Promise<void> {
    const pipelineAsync = promisify(pipeline);
    await pipelineAsync(fileStream, createWriteStream(outputPath));
  }

  async getPasswordForUser(username: string): Promise<string> {
    const user = await this.ensureValidUser(username);
    return EduApiUtility.decryptPassword(user?.password as string, this.passwordEncryptionKey);
  }

  static getPathWithoutWebdav(path: string): string {
    return path.replace('/webdav/', '');
  }
}

export default EduApiUtility;
