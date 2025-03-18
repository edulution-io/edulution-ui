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

import { createReadStream, existsSync, mkdirSync, readdirSync, renameSync, rmdirSync } from 'fs';
import { Response } from 'express';
import { HttpStatus, Injectable } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';

@Injectable()
class AttachmentService {
  domain: string;

  filePath: string;

  constructor(domain: string, filePath: string) {
    this.domain = domain;
    this.filePath = filePath;
  }

  getTemporaryAttachmentUrl = (userId: string, fileName: string): string => `${this.domain}/TEMP/${userId}/${fileName}`;

  getPersistentAttachmentUrl = (pathWithIds: string, fileName: string): string =>
    `${this.domain}/${pathWithIds}/${fileName}`;

  getTemporaryDirectory = (userId: string): string => `${this.filePath}/TEMP/${userId}`;

  getTemporaryAttachmentPath = (userId: string, fileName: string): string =>
    `${this.filePath}/TEMP/${userId}/${fileName}`;

  getPersistentDirectory = (pathWithIds: string): string => `${this.filePath}/${pathWithIds}`;

  getPersistentAttachmentPath = (pathWithIds: string, fileName: string): string =>
    `${this.filePath}/${pathWithIds}/${fileName}`;

  clearTEMP(userId: string) {
    const destination = this.getTemporaryDirectory(userId);
    if (existsSync(destination)) {
      rmdirSync(destination, { recursive: true, maxRetries: 3, retryDelay: 100 });
    }
  }

  clearPersistent(pathWithIds: string) {
    const destination = this.getPersistentDirectory(pathWithIds);
    if (existsSync(destination)) {
      rmdirSync(destination, { recursive: true, maxRetries: 3, retryDelay: 100 });
    }
  }

  servePersistentAttachment(pathWithIds: string, fileName: string, res: Response) {
    const filePath = this.getPersistentAttachmentPath(pathWithIds, fileName);
    if (!existsSync(filePath)) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }

  serveTemporaryAttachment(userId: string, fileName: string, res: Response) {
    const filePath = this.getTemporaryAttachmentPath(userId, fileName);
    if (!existsSync(filePath)) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }

  getFileNamesFromTEMP = (userId: string) => {
    const tempFolder = this.getTemporaryDirectory(userId);
    return readdirSync(tempFolder);
  };

  moveFileToPermanent(fileName: string, userId: string, pathWithIds: string) {
    const temporaryAttachmentPath = this.getTemporaryAttachmentPath(userId, fileName);
    const persistentAttachmentPath = this.getPersistentAttachmentPath(pathWithIds, fileName);
    renameSync(temporaryAttachmentPath, persistentAttachmentPath);
  }

  moveTempFileIntoPermanentDirectory(fileName: string, userId: string, pathWithIds: string) {
    const permanentDirectory = this.getPersistentDirectory(pathWithIds);
    if (!existsSync(permanentDirectory)) {
      mkdirSync(permanentDirectory, { recursive: true });
    }
    this.moveFileToPermanent(fileName, userId, pathWithIds);
  }

  moveTempFilesIntoPermanentDirectory(fileNames: string[], userId: string, pathWithIds: string) {
    const permanentDirectory = this.getPersistentDirectory(pathWithIds);
    if (!existsSync(permanentDirectory)) {
      mkdirSync(permanentDirectory, { recursive: true });
    }
    fileNames.forEach((fileName) => this.moveFileToPermanent(fileName, userId, pathWithIds));
  }
}

export default AttachmentService;
