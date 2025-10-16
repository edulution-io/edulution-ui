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
import FileSystemController from './filesystem.controller';
import FilesystemService from './filesystem.service';
import AdminGuard from '../appconfig/admin.guard';
import IsPublicAppGuard from '../common/guards/isPublicApp.guard';
import AppConfigService from '../appconfig/appconfig.service';
import CustomHttpException from '../common/CustomHttpException';

describe(FileSystemController.name, () => {
  let controller: FileSystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileSystemController],
      providers: [
        { provide: FilesystemService, useValue: {} },
        AdminGuard,
        IsPublicAppGuard,
        { provide: AppConfigService, useValue: { getPublicAppConfigByName: jest.fn().mockResolvedValue(true) } },
      ],
    }).compile();

    controller = module.get<FileSystemController>(FileSystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFileToApp', () => {
    it('returns 200 with provided filename', () => {
      const file = { filename: 'test.txt', mimetype: 'text/plain' } as unknown as Express.Multer.File;
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      controller.uploadFileToApp(file, { status } as unknown as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith('test.txt');
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
