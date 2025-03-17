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

import {
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
} from 'fs';
import { extname } from 'path';
import { Response } from 'express';
import { HttpStatus, Injectable } from '@nestjs/common';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';
import IMAGE_UPLOAD_ALLOWED_MIME_TYPES from '@libs/common/constants/imageUploadAllowedMimeTypes';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';

@Injectable()
class AttachmentService {
  constructor() {}

  static getTemporaryDirectory = (domain: string, userId: string): string => `${APPS_FILES_PATH}/${domain}/TEMP/${userId}`;

  static getTemporaryImagePath = (domain: string, userId: string, fileName: string): string => `${APPS_FILES_PATH}/${domain}/TEMP/${userId}/${fileName}`;

  static getPersistentImagePath = (domain: string, pathWithIds: string, fileName: string): string => `${APPS_FILES_PATH}/${domain}/${pathWithIds}/${fileName}`

  static getTemporaryImageUrl = (endpoint: string, userId: string, fileName: string): string => `${endpoint}/TEMP/${userId}/${fileName}`

  static getPersistentImageUrl = (endpoint: string, pathWithIds: string, fileName: string ): string => `${endpoint}/${pathWithIds}/${fileName}`

  static servePermanentImage(domain: string, pathWithIds: string, fileName: string, res: Response): Response {
    const imagePath = AttachmentService.getPersistentImagePath(domain, pathWithIds, fileName);
    if (!existsSync(imagePath)) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const fileStream = createReadStream(imagePath);
    fileStream.pipe(res);
    return res;
  }

  static serveTemporaryImage(domain: string, userId: string, fileName: string, res: Response): Response {
    const imagePath = AttachmentService.getTemporaryImagePath(domain, userId, fileName);
    if (!existsSync(imagePath)) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const fileStream = createReadStream(imagePath);
    fileStream.pipe(res);
    return res;
  }

  static getTemporaryDestination = (domain: string, userId: string, callback: CallableFunction) => {
    const destination = AttachmentService.getTemporaryDirectory(domain, userId);
    if (!existsSync(destination)) {
      mkdirSync(destination, { recursive: true });
    }
    callback(null, destination);
  }

  static getUniqueFileNames = (file: Express.Multer.File, callback: CallableFunction) => {
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    callback(null, uniqueFilename);
  }

  static filterMimeTypes = (mimeType: string, callback: CallableFunction) => {
    if (IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(mimeType)) {
      callback(null, true);
    } else {
      callback(
        new CustomHttpException(CommonErrorMessages.INVALID_FILE_TYPE, HttpStatus.INTERNAL_SERVER_ERROR),
        false,
      );
    }
  }

  static checkImageFile(file: Express.Multer.File): string {
    if (!file) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_PROVIDED, HttpStatus.BAD_REQUEST);
    }
    if (!IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new CustomHttpException(CommonErrorMessages.ATTACHMENT_UPLOAD_FAILED, HttpStatus.BAD_REQUEST);
    }
    return file.filename;
  }

  static getFileNamesFromTEMP = (domain: string, userId: string) => {
    const tempFolder = AttachmentService.getTemporaryDirectory(domain, userId);
    return readdirSync(tempFolder);
  }

  // static moveFileToPermanentFiles = (domain: string, pathWithIds: string, userId: string): void => {
  //
  // }
}

export default AttachmentService;
