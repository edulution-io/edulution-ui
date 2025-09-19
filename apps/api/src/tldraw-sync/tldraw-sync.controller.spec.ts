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

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import { Response } from 'express';
import TLDrawSyncController from './tldraw-sync.controller';
import FilesystemService from '../filesystem/filesystem.service';
import TLDrawSyncService from './tldraw-sync.service';
import CustomHttpException from '../common/CustomHttpException';

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
});
