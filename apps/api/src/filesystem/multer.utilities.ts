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
