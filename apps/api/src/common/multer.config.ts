import { extname } from 'path';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { HttpStatus } from '@nestjs/common';
import IMAGE_UPLOAD_ALLOWED_MIME_TYPES from '@libs/common/constants/imageUploadAllowedMimeTypes';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';

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

export const createAttachmentUploadOptions = (getDestinationPath: (req: Request) => string) => ({
  storage: createDiskStorage(getDestinationPath),
  fileFilter: attachmentFileFilter,
});

export const checkAttachmentFile = (file: Express.Multer.File): string => {
  if (!file) {
    throw new CustomHttpException(CommonErrorMessages.FILE_NOT_PROVIDED, HttpStatus.BAD_REQUEST);
  }
  if (!IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new CustomHttpException(CommonErrorMessages.ATTACHMENT_UPLOAD_FAILED, HttpStatus.BAD_REQUEST);
  }
  return file.filename;
};
