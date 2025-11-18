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
import { HttpStatus } from '@nestjs/common';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import { Response } from 'express';
import BulletinBoardController from './bulletinboard.controller';
import BulletinBoardService from './bulletinboard.service';
import CustomHttpException from '../common/CustomHttpException';

describe(BulletinBoardController.name, () => {
  let controller: BulletinBoardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BulletinBoardController],
      providers: [{ provide: BulletinBoardService, useValue: {} }],
    }).compile();

    controller = module.get<BulletinBoardController>(BulletinBoardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadBulletinAttachment', () => {
    it('returns 200 with provided filename for allowed mime types', () => {
      const file = { filename: 'image.png', mimetype: 'image/png' } as unknown as Express.Multer.File;
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      controller.uploadBulletinAttachment(file, { status } as unknown as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith('image.png');
    });

    it('throws CustomHttpException on missing file (malformed upload)', () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      try {
        controller.uploadBulletinAttachment(
          undefined as unknown as Express.Multer.File,
          { status } as unknown as Response,
        );
        fail('Expected to throw');
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect((e as Error).message).toBe(CommonErrorMessages.FILE_NOT_PROVIDED);
        expect((e as CustomHttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('throws CustomHttpException on disallowed mime types', () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      try {
        controller.uploadBulletinAttachment(
          { filename: 'doc.txt', mimetype: 'text/plain' } as unknown as Express.Multer.File,
          { status } as unknown as Response,
        );
        fail('Expected to throw');
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect((e as Error).message).toBe(CommonErrorMessages.FILE_UPLOAD_FAILED);
        expect((e as CustomHttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
