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

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import WHITEBOARD_FILES_PATH from '@libs/whiteboard/constants/whiteboardFilesPath';
import { Response } from 'express';
import TLDrawSyncController from './tldraw-sync.controller';
import FilesystemService from '../filesystem/filesystem.service';
import TLDrawSyncService from './tldraw-sync.service';
import CustomHttpException from '../common/CustomHttpException';
import ValidatePathPipe from '../common/pipes/validatePath.pipe';

jest.mock('./tldraw-sync.service', () => ({ __esModule: true, default: class {} }));

describe(TLDrawSyncController.name, () => {
  let controller: TLDrawSyncController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TLDrawSyncController],
      providers: [
        { provide: FilesystemService, useValue: {} },
        { provide: TLDrawSyncService, useValue: {} },
      ],
    }).compile();

    controller = module.get<TLDrawSyncController>(TLDrawSyncController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFileToApp', () => {
    it('returns 200 with provided filename', () => {
      const file = { filename: 'asset.bin', mimetype: 'application/octet-stream' } as unknown as Express.Multer.File;
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      controller.uploadFileToApp(file, { status } as unknown as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith('asset.bin');
    });

    it('throws CustomHttpException on missing file (malformed upload)', () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      try {
        controller.uploadFileToApp(undefined as unknown as Express.Multer.File, { status } as unknown as Response);
        fail('Expected to throw');
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect((e as Error).message).toBe(CommonErrorMessages.FILE_NOT_PROVIDED);
        expect((e as CustomHttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('path validation for whiteboard assets', () => {
    const pipe = new ValidatePathPipe(WHITEBOARD_FILES_PATH);

    describe('valid whiteboard filenames', () => {
      it('should accept a typical whiteboard asset filename', () => {
        expect(pipe.transform('abc123def456.png')).toBe('abc123def456.png');
      });

      it('should accept a whiteboard export with hyphens', () => {
        expect(pipe.transform('whiteboard-export-2025.svg')).toBe('whiteboard-export-2025.svg');
      });

      it('should accept an asset in a subdirectory', () => {
        expect(pipe.transform('assets/image.webp')).toBe('assets/image.webp');
      });

      it('should accept array params as used by wildcard routes', () => {
        expect(pipe.transform(['assets', 'drawing.png'])).toBe('assets/drawing.png');
      });
    });

    describe('path traversal attacks on whiteboard assets', () => {
      it('should block traversal attempting to escape whiteboard directory', () => {
        const result = pipe.transform('../../etc/passwd');
        expect(result).not.toContain('..');
      });

      it('should strip shell metacharacters from filenames', () => {
        const result = pipe.transform('asset$(whoami).png');
        expect(result).toBe('assetwhoami.png');
      });

      it('should strip spaces and special chars from whiteboard filenames', () => {
        const result = pipe.transform('my drawing (1).png');
        expect(result).toBe('mydrawing1.png');
      });

      it('should throw for empty filename', () => {
        expect(() => pipe.transform('')).toThrow(BadRequestException);
      });
    });
  });
});
