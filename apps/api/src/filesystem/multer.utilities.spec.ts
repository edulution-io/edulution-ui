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

import { resolve, sep } from 'node:path';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import { MulterError } from 'multer';
import PathValidationErrorMessages from '@libs/common/constants/path-validation-error-messages';
import { createDiskStorage, attachmentFileFilter, createAttachmentUploadOptions } from './multer.utilities';

type MulterCallback = (error: Error | null, result: string) => void;
type MulterStorageHandler = (req: Request, file: Express.Multer.File, cb: MulterCallback) => void;

let capturedDestination: MulterStorageHandler;
let capturedFilename: MulterStorageHandler;

jest.mock('multer', () => {
  const actual = jest.requireActual<typeof import('multer')>('multer');
  return {
    ...actual,
    diskStorage: (config: { destination: MulterStorageHandler; filename: MulterStorageHandler }) => {
      capturedDestination = config.destination;
      capturedFilename = config.filename;
      return { _handleFile: jest.fn(), _removeFile: jest.fn() };
    },
  };
});

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

const BASE_PATH = '/data/apps/whiteboard';
const mockReq = {} as Request;
const mockFile = { originalname: 'test.png', fieldname: 'file' } as Express.Multer.File;

describe('multer.utilities', () => {
  describe('createDiskStorage destination validation', () => {
    it('should allow a destination within the base path', () => {
      createDiskStorage(BASE_PATH, () => `${BASE_PATH}/assets`);

      const cb = jest.fn();
      capturedDestination(mockReq, mockFile, cb);

      expect(cb).toHaveBeenCalledWith(null, `${BASE_PATH}/assets`);
    });

    it('should allow a destination equal to the base path', () => {
      createDiskStorage(BASE_PATH, () => BASE_PATH);

      const cb = jest.fn();
      capturedDestination(mockReq, mockFile, cb);

      expect(cb).toHaveBeenCalledWith(null, BASE_PATH);
    });

    it('should reject a destination outside the base path', () => {
      createDiskStorage(BASE_PATH, () => '/etc/passwd');

      const cb = jest.fn();
      capturedDestination(mockReq, mockFile, cb);

      expect(cb).toHaveBeenCalledWith(expect.any(BadRequestException), '');
      const [[error]] = cb.mock.calls as [[BadRequestException, string]];
      expect(error.message).toBe(PathValidationErrorMessages.OutsidePublicDirectory);
    });

    it('should reject a traversal attempt in destination path', () => {
      createDiskStorage(BASE_PATH, () => `${BASE_PATH}/../../etc`);

      const cb = jest.fn();
      capturedDestination(mockReq, mockFile, cb);

      const resolvedDest = resolve(`${BASE_PATH}/../../etc`);
      const resolvedBase = resolve(BASE_PATH);
      const isOutside = !resolvedDest.startsWith(resolvedBase + sep) && resolvedDest !== resolvedBase;

      if (isOutside) {
        expect(cb).toHaveBeenCalledWith(expect.any(BadRequestException), '');
      } else {
        expect(cb).toHaveBeenCalledWith(null, expect.any(String));
      }
    });
  });

  describe('createDiskStorage filename sanitization', () => {
    it('should sanitize a normal filename', () => {
      createDiskStorage(BASE_PATH, () => BASE_PATH);

      const cb = jest.fn();
      capturedFilename(mockReq, { ...mockFile, originalname: 'photo.jpg' } as Express.Multer.File, cb);

      expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/\.jpg$/));
    });

    it('should sanitize a custom filename with special characters', () => {
      createDiskStorage(
        BASE_PATH,
        () => BASE_PATH,
        () => 'my file (copy).png',
      );

      const cb = jest.fn();
      capturedFilename(mockReq, mockFile, cb);

      expect(cb).toHaveBeenCalledWith(null, 'myfilecopy.png');
    });

    it('should strip path traversal from generated filename', () => {
      createDiskStorage(
        BASE_PATH,
        () => BASE_PATH,
        () => '../../etc/passwd',
      );

      const cb = jest.fn();
      capturedFilename(mockReq, mockFile, cb);

      const [[, savedFilename]] = cb.mock.calls as [[null, string]];
      expect(savedFilename).not.toContain('..');
      expect(savedFilename).not.toContain('/');
    });

    it('should use basename to prevent directory injection in filename', () => {
      createDiskStorage(
        BASE_PATH,
        () => BASE_PATH,
        () => 'subdir/malicious.sh',
      );

      const cb = jest.fn();
      capturedFilename(mockReq, mockFile, cb);

      expect(cb).toHaveBeenCalledWith(null, 'malicious.sh');
    });
  });

  describe('attachmentFileFilter', () => {
    it('should accept image/png', () => {
      const cb = jest.fn();
      attachmentFileFilter(mockReq, { ...mockFile, mimetype: 'image/png' } as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should accept image/jpeg', () => {
      const cb = jest.fn();
      attachmentFileFilter(mockReq, { ...mockFile, mimetype: 'image/jpeg' } as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should accept image/svg+xml', () => {
      const cb = jest.fn();
      attachmentFileFilter(mockReq, { ...mockFile, mimetype: 'image/svg+xml' } as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should reject application/javascript', () => {
      const cb = jest.fn();
      attachmentFileFilter(mockReq, { ...mockFile, mimetype: 'application/javascript' } as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(expect.any(MulterError), false);
    });

    it('should reject text/html', () => {
      const cb = jest.fn();
      attachmentFileFilter(mockReq, { ...mockFile, mimetype: 'text/html' } as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(expect.any(MulterError), false);
    });
  });

  describe('createAttachmentUploadOptions', () => {
    it('should include file filter when filter is true', () => {
      const options = createAttachmentUploadOptions(BASE_PATH, () => BASE_PATH, true);
      expect(options.fileFilter).toBeDefined();
    });

    it('should omit file filter when filter is false', () => {
      const options = createAttachmentUploadOptions(BASE_PATH, () => BASE_PATH, false);
      expect(options.fileFilter).toBeUndefined();
    });

    it('should use custom max file size when provided', () => {
      const options = createAttachmentUploadOptions(BASE_PATH, () => BASE_PATH, true, undefined, 1024);
      expect(options.limits).toEqual({ fileSize: 1024 });
    });
  });
});
