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
import { extname } from 'path';
import { Response } from 'express';
import { HttpStatus, Injectable } from '@nestjs/common';
import IMAGE_UPLOAD_ALLOWED_MIME_TYPES from '@libs/common/constants/imageUploadAllowedMimeTypes';
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

  getTemporaryImageUrl = (userId: string, fileName: string): string => `${this.domain}/TEMP/${userId}/${fileName}`;

  getPersistentImageUrl = (pathWithIds: string, fileName: string): string =>
    `${this.domain}/${pathWithIds}/${fileName}`;

  getTemporaryDirectory = (userId: string): string => `${this.filePath}/TEMP/${userId}`;

  getTemporaryImagePath = (userId: string, fileName: string): string => `${this.filePath}/TEMP/${userId}/${fileName}`;

  getPersistentDirectory = (pathWithIds: string): string => `${this.filePath}/${pathWithIds}`;

  getPersistentImagePath = (pathWithIds: string, fileName: string): string =>
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

  servePermanentImage(pathWithIds: string, fileName: string, res: Response) {
    const imagePath = this.getPersistentImagePath(pathWithIds, fileName);
    if (!existsSync(imagePath)) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const fileStream = createReadStream(imagePath);
    fileStream.pipe(res);
    return res;
  }

  serveTemporaryImage(userId: string, fileName: string, res: Response) {
    const imagePath = this.getTemporaryImagePath(userId, fileName);
    if (!existsSync(imagePath)) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const fileStream = createReadStream(imagePath);
    fileStream.pipe(res);
    return res;
  }

  getFileNamesFromTEMP = (userId: string) => {
    const tempFolder = this.getTemporaryDirectory(userId);
    return readdirSync(tempFolder);
  };

  moveFileToPermanent(fileName: string, userId: string, pathWithIds: string) {
    const temporalImagePath = this.getTemporaryImagePath(userId, fileName);
    const permanentImagePath = this.getPersistentImagePath(pathWithIds, fileName);
    renameSync(temporalImagePath, permanentImagePath);
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

  // FILE INTERCEPTOR METHODS
  static getTemporaryDestination = (path: string, userId: string, callback: CallableFunction) => {
    const destination = `${path}/TEMP/${userId}`;
    if (!existsSync(destination)) {
      mkdirSync(destination, { recursive: true });
    }
    callback(null, destination);
  };

  static getUniqueFileNames = (file: Express.Multer.File, callback: CallableFunction) => {
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    callback(null, uniqueFilename);
  };

  static filterMimeTypes = (mimeType: string, callback: CallableFunction) => {
    if (IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(mimeType)) {
      callback(null, true);
    } else {
      callback(new CustomHttpException(CommonErrorMessages.INVALID_FILE_TYPE, HttpStatus.INTERNAL_SERVER_ERROR), false);
    }
  };

  static checkImageFile(file: Express.Multer.File): string {
    if (!file) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_PROVIDED, HttpStatus.BAD_REQUEST);
    }
    if (!IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new CustomHttpException(CommonErrorMessages.ATTACHMENT_UPLOAD_FAILED, HttpStatus.BAD_REQUEST);
    }
    return file.filename;
  }
}

export default AttachmentService;
