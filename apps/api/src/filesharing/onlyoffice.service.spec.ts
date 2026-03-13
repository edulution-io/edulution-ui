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

import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import APPS from '@libs/appconfig/constants/apps';
import ONLY_OFFICE_CALLBACK_STATUS from '@libs/filesharing/constants/onlyOfficeCallbackStatus';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import OnlyofficeService from './onlyoffice.service';
import AppConfigService from '../appconfig/appconfig.service';
import FilesystemService from '../filesystem/filesystem.service';

const MOCK_JWT_SECRET = 'onlyoffice-jwt-secret';

const createMockAppConfig = (jwtSecret?: string) => ({
  name: APPS.FILE_SHARING,
  extendedOptions: jwtSecret ? { [ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET]: jwtSecret } : {},
});

describe(OnlyofficeService.name, () => {
  let service: OnlyofficeService;
  let appConfigService: Record<string, jest.Mock>;
  let jwtService: Record<string, jest.Mock>;

  beforeEach(async () => {
    appConfigService = {
      getAppConfigByName: jest.fn().mockResolvedValue(createMockAppConfig(MOCK_JWT_SECRET)),
      patchSingleFieldInConfig: jest.fn().mockResolvedValue(undefined),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-oo-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnlyofficeService,
        { provide: AppConfigService, useValue: appConfigService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<OnlyofficeService>(OnlyofficeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should not patch config when appConfig does not exist', async () => {
      appConfigService.getAppConfigByName.mockResolvedValue(null);

      await service.onModuleInit();

      expect(appConfigService.patchSingleFieldInConfig).not.toHaveBeenCalled();
    });

    it('should not patch config when extendedOptions already has keys', async () => {
      appConfigService.getAppConfigByName.mockResolvedValue(createMockAppConfig(MOCK_JWT_SECRET));

      await service.onModuleInit();

      expect(appConfigService.patchSingleFieldInConfig).not.toHaveBeenCalled();
    });

    it('should not patch config when extendedOptions is undefined', async () => {
      appConfigService.getAppConfigByName.mockResolvedValue({
        name: APPS.FILE_SHARING,
        extendedOptions: undefined,
      });

      await service.onModuleInit();

      expect(appConfigService.patchSingleFieldInConfig).not.toHaveBeenCalled();
    });
  });

  describe('generateOnlyOfficeToken', () => {
    it('should return a signed JWT token', async () => {
      const result = await service.generateOnlyOfficeToken('payload-data');

      expect(result).toBe('signed-oo-token');
      expect(jwtService.sign).toHaveBeenCalledWith('payload-data', { secret: MOCK_JWT_SECRET });
    });

    it('should throw when JWT secret is not configured', async () => {
      appConfigService.getAppConfigByName.mockResolvedValue(createMockAppConfig());

      await expect(service.generateOnlyOfficeToken('payload')).rejects.toMatchObject({
        message: FileSharingErrorMessage.AppNotProperlyConfigured,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });

    it('should throw when appConfig is null', async () => {
      appConfigService.getAppConfigByName.mockResolvedValue(null);

      await expect(service.generateOnlyOfficeToken('payload')).rejects.toMatchObject({
        message: FileSharingErrorMessage.AppNotProperlyConfigured,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });

    it('should throw when extendedOptions is undefined', async () => {
      appConfigService.getAppConfigByName.mockResolvedValue({
        name: APPS.FILE_SHARING,
        extendedOptions: undefined,
      });

      await expect(service.generateOnlyOfficeToken('payload')).rejects.toMatchObject({
        message: FileSharingErrorMessage.AppNotProperlyConfigured,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('handleCallback', () => {
    let mockRes: { status: jest.Mock; json: jest.Mock };

    beforeEach(() => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      mockRes = { status, json };
    });

    it('should return OK with error 0 for editing status', async () => {
      const mockReq = { body: { status: ONLY_OFFICE_CALLBACK_STATUS.EDITING } } as never;

      await OnlyofficeService.handleCallback(mockReq, mockRes as never, '/docs', 'test.docx', 'teacher', jest.fn());

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return OK with error 0 for saving error status', async () => {
      const mockReq = { body: { status: ONLY_OFFICE_CALLBACK_STATUS.SAVING_ERROR } } as never;

      await OnlyofficeService.handleCallback(mockReq, mockRes as never, '/docs', 'test.docx', 'teacher', jest.fn());

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return OK with error 0 for force saving error status', async () => {
      const mockReq = { body: { status: ONLY_OFFICE_CALLBACK_STATUS.FORCE_SAVING_ERROR } } as never;

      await OnlyofficeService.handleCallback(mockReq, mockRes as never, '/docs', 'test.docx', 'teacher', jest.fn());

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should process file for closed_without_changes status', async () => {
      const mockFile = { originalname: 'test.docx' } as never;
      const mockReq = {
        body: { status: ONLY_OFFICE_CALLBACK_STATUS.CLOSED_WITHOUT_CHANGES, url: 'https://oo.example.com/file' },
      } as never;
      const uploadFile = jest.fn().mockResolvedValue({ status: 'ok' });

      jest.spyOn(FilesystemService, 'retrieveAndSaveFile').mockResolvedValue(mockFile);
      jest.spyOn(FilesystemService, 'deleteFile').mockResolvedValue(undefined);

      await OnlyofficeService.handleCallback(mockReq, mockRes as never, '/docs', 'test.docx', 'teacher', uploadFile);

      expect(uploadFile).toHaveBeenCalledWith('teacher', '/docs', mockFile, '');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should process file for force_saving status', async () => {
      const mockFile = { originalname: 'test.docx' } as never;
      const mockReq = {
        body: { status: ONLY_OFFICE_CALLBACK_STATUS.FORCE_SAVING, url: 'https://oo.example.com/file' },
      } as never;
      const uploadFile = jest.fn().mockResolvedValue({ status: 'ok' });

      jest.spyOn(FilesystemService, 'retrieveAndSaveFile').mockResolvedValue(mockFile);
      jest.spyOn(FilesystemService, 'deleteFile').mockResolvedValue(undefined);

      await OnlyofficeService.handleCallback(mockReq, mockRes as never, '/docs', 'test.docx', 'teacher', uploadFile);

      expect(uploadFile).toHaveBeenCalledWith('teacher', '/docs', mockFile, '');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return NOT_FOUND with error 1 when file retrieval fails', async () => {
      const mockReq = {
        body: { status: ONLY_OFFICE_CALLBACK_STATUS.READY_FOR_SAVING, url: 'https://oo.example.com/file' },
      } as never;
      jest.spyOn(FilesystemService, 'retrieveAndSaveFile').mockResolvedValue(undefined);
      const jsonFn = jest.fn();
      mockRes.status.mockReturnValue({ json: jsonFn });

      await OnlyofficeService.handleCallback(mockReq, mockRes as never, '/docs', 'test.docx', 'teacher', jest.fn());

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(jsonFn).toHaveBeenCalledWith({ error: 1 });
    });

    it('should upload file, clean up, and return OK with error 0 for ready_for_saving', async () => {
      const mockFile = { originalname: 'test.docx' } as never;
      const mockReq = {
        body: { status: ONLY_OFFICE_CALLBACK_STATUS.READY_FOR_SAVING, url: 'https://oo.example.com/file' },
      } as never;
      const uploadFile = jest.fn().mockResolvedValue({ status: 'ok' });
      const jsonFn = jest.fn();
      mockRes.status.mockReturnValue({ json: jsonFn });

      jest.spyOn(FilesystemService, 'retrieveAndSaveFile').mockResolvedValue(mockFile);
      jest.spyOn(FilesystemService, 'deleteFile').mockResolvedValue(undefined);

      await OnlyofficeService.handleCallback(mockReq, mockRes as never, '/docs', 'test.docx', 'teacher', uploadFile);

      expect(uploadFile).toHaveBeenCalledWith('teacher', '/docs', mockFile, '');
      expect(FilesystemService.deleteFile).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(jsonFn).toHaveBeenCalledWith({ error: 0 });
    });
  });
});
