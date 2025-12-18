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
import { join } from 'path';
import APPS from '@libs/appconfig/constants/apps';
import PUBLIC_ASSET_PATH from '@libs/common/constants/publicAssetPath';
import FileSystemController from './filesystem.controller';
import FilesystemService from './filesystem.service';
import IsPublicAppGuard from '../common/guards/isPublicApp.guard';
import AdminGuard from '../common/guards/admin.guard';
import AppConfigService from '../appconfig/appconfig.service';
import CustomHttpException from '../common/CustomHttpException';
import GlobalSettingsService from '../global-settings/global-settings.service';

jest.mock('../common/utils/validatePathNoPathTraversal', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe(FileSystemController.name, () => {
  let controller: FileSystemController;
  let service: FilesystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileSystemController],
      providers: [
        { provide: FilesystemService, useValue: { servePublicAssetWithFallback: jest.fn().mockResolvedValue({}) } },
        AdminGuard,
        IsPublicAppGuard,
        { provide: AppConfigService, useValue: { getPublicAppConfigByName: jest.fn().mockResolvedValue(true) } },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn() } },
      ],
    }).compile();

    controller = module.get<FileSystemController>(FileSystemController);
    service = module.get<FilesystemService>(FilesystemService);
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

  describe('servePublicAssetWithFallback', () => {
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      jest.spyOn(FilesystemService, 'getFilePathAndFallBackPath').mockReturnValue({
        filePath: '/test/path/file.png',
        fallBackPath: '/test/path/fallback.png',
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Successful file serving', () => {
      it('should successfully serve a file without fallback', async () => {
        const appName = Object.values(APPS)[0];
        const filename = 'logo.png';

        await controller.servePublicAssetWithFallback(mockResponse as Response, appName, filename, undefined);

        expect(FilesystemService.getFilePathAndFallBackPath).toHaveBeenCalledWith(appName, filename, undefined);
        expect(service.servePublicAssetWithFallback).toHaveBeenCalledWith(
          mockResponse,
          '/test/path/file.png',
          '/test/path/fallback.png',
        );
      });

      it('should successfully serve a file with fallback', async () => {
        const appName = Object.values(APPS)[0];
        const filename = 'missing-logo.png';
        const fallbackFilename = 'default-logo.png';

        await controller.servePublicAssetWithFallback(mockResponse as Response, appName, filename, fallbackFilename);

        expect(FilesystemService.getFilePathAndFallBackPath).toHaveBeenCalledWith(appName, filename, fallbackFilename);
        expect(service.servePublicAssetWithFallback).toHaveBeenCalledWith(
          mockResponse,
          '/test/path/file.png',
          '/test/path/fallback.png',
        );
      });

      it('should handle array filename parameter', async () => {
        const appName = Object.values(APPS)[0];
        const filename = ['assets', 'images', 'logo.png'];

        await controller.servePublicAssetWithFallback(mockResponse as Response, appName, filename, undefined);

        expect(FilesystemService.getFilePathAndFallBackPath).toHaveBeenCalledWith(appName, filename, undefined);
        expect(service.servePublicAssetWithFallback).toHaveBeenCalled();
      });
    });

    describe('Invalid app name handling', () => {
      it('should throw error for non-existent app name', async () => {
        const invalidAppName = 'non-existent-app';
        const filename = 'logo.png';

        try {
          await controller.servePublicAssetWithFallback(mockResponse as Response, invalidAppName, filename, undefined);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e instanceof Error && e.message).toBe(CommonErrorMessages.INVALID_REQUEST_DATA);
        }
      });
    });

    describe('Path traversal attack attempts', () => {
      it('should detect and reject path traversal in main file path', async () => {
        const appName = Object.values(APPS)[0];
        const filename = '../../../etc/passwd';

        jest.spyOn(FilesystemService, 'getFilePathAndFallBackPath').mockReturnValue({
          filePath: '/unsafe/path/../../../etc/passwd',
        });

        try {
          await controller.servePublicAssetWithFallback(mockResponse as Response, appName, filename, undefined);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e instanceof Error && e.message).toBe(CommonErrorMessages.INVALID_REQUEST_DATA);
        }
      });

      it('should detect and reject path traversal in fallback path', async () => {
        const appName = Object.values(APPS)[0];
        const filename = 'logo.png';
        const fallbackFilename = '../../../etc/shadow';

        try {
          await controller.servePublicAssetWithFallback(mockResponse as Response, appName, filename, fallbackFilename);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e instanceof Error && e.message).toBe(CommonErrorMessages.INVALID_REQUEST_DATA);
        }
      });

      it('should handle double slash attempts', async () => {
        const appName = Object.values(APPS)[0];
        const filename = 'assets//sensitive//file.txt';

        jest.spyOn(FilesystemService, 'getFilePathAndFallBackPath').mockReturnValue({
          filePath: '/path//with//double//slashes',
        });

        try {
          await controller.servePublicAssetWithFallback(mockResponse as Response, appName, filename, undefined);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e instanceof Error && e.message).toBe(CommonErrorMessages.INVALID_REQUEST_DATA);
        }
      });

      it('should handle complex path traversal with array filename', async () => {
        const appName = Object.values(APPS)[0];
        const filename = ['..', '..', '..', 'etc', 'passwd'];

        jest.spyOn(FilesystemService, 'getFilePathAndFallBackPath').mockReturnValue({
          filePath: '/complex/../../../etc/passwd',
        });

        try {
          await controller.servePublicAssetWithFallback(mockResponse as Response, appName, filename, undefined);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e instanceof Error && e.message).toBe(CommonErrorMessages.INVALID_REQUEST_DATA);
        }
      });
    });

    describe('Edge cases and validation', () => {
      it('should handle empty filename', async () => {
        const appName = Object.values(APPS)[0];
        const filename = '';

        jest.spyOn(FilesystemService, 'getFilePathAndFallBackPath').mockReturnValue({
          filePath: '/empty/path/',
        });

        try {
          await controller.servePublicAssetWithFallback(mockResponse as Response, appName, filename, undefined);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e instanceof Error && e.message).toBe(CommonErrorMessages.INVALID_REQUEST_DATA);
        }
      });

      it('should handle special characters in filename', async () => {
        const appName = Object.values(APPS)[0];
        const filename = 'file with spaces & symbols.png';

        await controller.servePublicAssetWithFallback(mockResponse as Response, appName, filename, undefined);

        expect(FilesystemService.getFilePathAndFallBackPath).toHaveBeenCalledWith(appName, filename, undefined);
      });

      it('should handle null fallback filename', async () => {
        const appName = Object.values(APPS)[0];
        const filename = 'logo.png';

        jest.spyOn(FilesystemService, 'getFilePathAndFallBackPath').mockReturnValue({
          filePath: '/path/logo.png',
        });

        await controller.servePublicAssetWithFallback(mockResponse as Response, appName, filename, undefined);
      });
    });
  });

  describe('deletePublicFile', () => {
    beforeEach(() => {
      jest.spyOn(FilesystemService, 'deleteFile').mockResolvedValue();
      jest.spyOn(FilesystemService, 'buildPathString').mockImplementation((path) => {
        if (Array.isArray(path)) {
          return join(...path);
        }
        return path;
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Successful file deletion by admin', () => {
      it('should successfully delete a single file', async () => {
        const appName = Object.values(APPS)[0];
        const filename = 'test-image.png';

        await controller.deletePublicFile(appName, filename);

        expect(FilesystemService.deleteFile).toHaveBeenCalledWith(join(PUBLIC_ASSET_PATH, appName), filename);
      });

      it('should successfully delete a file with array filename', async () => {
        const appName = Object.values(APPS)[0];
        const filename = ['assets', 'images', 'logo.png'];

        await controller.deletePublicFile(appName, filename);

        expect(FilesystemService.buildPathString).toHaveBeenCalledWith(filename);
        expect(FilesystemService.deleteFile).toHaveBeenCalledWith(
          join(PUBLIC_ASSET_PATH, appName),
          'assets/images/logo.png',
        );
      });

      it('should successfully delete a nested file', async () => {
        const appName = Object.values(APPS)[0];
        const filename = 'subfolder/nested-file.jpg';

        await controller.deletePublicFile(appName, filename);

        expect(FilesystemService.deleteFile).toHaveBeenCalledWith(join(PUBLIC_ASSET_PATH, appName), filename);
      });
    });

    describe('Attempts to delete non-existent files', () => {
      it('should handle file deletion error gracefully', async () => {
        const appName = Object.values(APPS)[0];
        const filename = 'non-existent-file.png';

        jest
          .spyOn(FilesystemService, 'deleteFile')
          .mockRejectedValue(
            new CustomHttpException(
              CommonErrorMessages.FILE_DELETION_FAILED,
              HttpStatus.INTERNAL_SERVER_ERROR,
              join(PUBLIC_ASSET_PATH, appName, filename),
            ),
          );

        try {
          await controller.deletePublicFile(appName, filename);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e instanceof Error && e.message).toBe(CommonErrorMessages.FILE_DELETION_FAILED);
        }

        expect(FilesystemService.deleteFile).toHaveBeenCalledWith(join(PUBLIC_ASSET_PATH, appName), filename);
      });

      it('should propagate file system errors', async () => {
        const appName = Object.values(APPS)[0];
        const filename = 'locked-file.png';

        jest.spyOn(FilesystemService, 'deleteFile').mockRejectedValue(new Error('EACCES: permission denied'));

        try {
          await controller.deletePublicFile(appName, filename);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e instanceof Error && e.message).toBe('EACCES: permission denied');
        }
      });
    });
  });
});
