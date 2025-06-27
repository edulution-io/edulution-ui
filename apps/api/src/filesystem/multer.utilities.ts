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

import { extname } from 'path';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { HttpStatus } from '@nestjs/common';
import IMAGE_UPLOAD_ALLOWED_MIME_TYPES from '@libs/common/constants/imageUploadAllowedMimeTypes';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import CustomHttpException from '../common/CustomHttpException';

/**
 * Generates a disk storage configuration that can dynamically
 * determine destination paths and file names.
 *
 * @param getDestinationPath - function returning the folder path, given the request
 * @param fileNameGenerator - optional function to generate the file name
 */
export const createDiskStorage = (
  getDestinationPath: (req: Request) => string,
  fileNameGenerator?: (req: Request, file: Express.Multer.File) => string,
) =>
  diskStorage({
    destination: (req, _file, callback) => {
      const folderPath = getDestinationPath(req);
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
      }
      callback(null, folderPath);
    },
    filename: (req, file, callback) => {
      let fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
      if (fileNameGenerator) {
        fileName = fileNameGenerator(req, file);
      }
      callback(null, fileName);
    },
  });

export const attachmentFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new CustomHttpException(CommonErrorMessages.INVALID_FILE_TYPE, HttpStatus.INTERNAL_SERVER_ERROR), false);
  }
};

export const createAttachmentUploadOptions = (
  getDestinationPath: (req: Request) => string,
  filter: boolean = true,
  fileNameGenerator?: (req: Request, file: Express.Multer.File) => string,
) => ({
  storage: createDiskStorage(getDestinationPath, fileNameGenerator),
  fileFilter: filter ? attachmentFileFilter : undefined,
});

export const checkAttachmentFile = (file: Express.Multer.File): string => {
  if (!file) {
    throw new CustomHttpException(CommonErrorMessages.FILE_NOT_PROVIDED, HttpStatus.BAD_REQUEST);
  }
  if (!IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new CustomHttpException(CommonErrorMessages.FILE_UPLOAD_FAILED, HttpStatus.BAD_REQUEST);
  }
  return file.filename;
};
