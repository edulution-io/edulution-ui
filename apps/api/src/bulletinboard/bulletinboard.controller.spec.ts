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
import { Response } from 'express';
import BULLETIN_TEMP_ATTACHMENTS_PATH from '@libs/bulletinBoard/constants/bulletinTempAttachmentsPath';
import BulletinBoardController from './bulletinboard.controller';
import BulletinBoardService from './bulletinboard.service';
import ValidatePathPipe from '../common/pipes/validatePath.pipe';

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
  });

  describe('path validation for bulletin attachments', () => {
    const pipe = new ValidatePathPipe(BULLETIN_TEMP_ATTACHMENTS_PATH);

    describe('valid bulletin attachment filenames', () => {
      it('should accept a UUID-prefixed attachment', () => {
        expect(pipe.transform('a1b2c3d4-e5f6-7890-abcd-ef1234567890-image.png')).toBe(
          'a1b2c3d4-e5f6-7890-abcd-ef1234567890-image.png',
        );
      });

      it('should accept a simple image filename', () => {
        expect(pipe.transform('photo.jpg')).toBe('photo.jpg');
      });
    });

    describe('path traversal attacks on bulletin attachments', () => {
      it('should sanitize traversal in attachment filename', () => {
        const result = pipe.transform('../../../etc/shadow');
        expect(result).not.toContain('..');
      });

      it('should strip encoded characters and remove traversal', () => {
        const result = pipe.transform('file%2F..%2F..%2Fetc%2Fpasswd');
        expect(result).toBe('file2F2F2Fetc2Fpasswd');
      });

      it('should return undefined for null input via the pipe', () => {
        expect(pipe.transform(null as unknown as string)).toBeUndefined();
      });
    });
  });
});
