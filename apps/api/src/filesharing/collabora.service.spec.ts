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
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import PathValidationErrorMessages from '@libs/common/constants/path-validation-error-messages';
import { WOPI_TOKEN_EXPIRY, WOPI_TOKEN_TTL_MS } from '@libs/filesharing/constants/wopi';
import CollaboraService from './collabora.service';
import AppConfigService from '../appconfig/appconfig.service';
import WebdavService from '../webdav/webdav.service';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';

const MOCK_SECRET = 'test-wopi-secret';

const createMockAppConfig = (secret?: string) => ({
  name: APPS.FILE_SHARING,
  extendedOptions: secret ? { [ExtendedOptionKeys.COLLABORA_WOPI_SECRET]: secret } : {},
});

describe(CollaboraService.name, () => {
  let service: CollaboraService;
  let appConfigService: Record<string, jest.Mock>;
  let jwtService: Record<string, jest.Mock>;
  let webdavService: Record<string, jest.Mock>;
  let webdavSharesService: Record<string, jest.Mock>;

  beforeEach(async () => {
    appConfigService = {
      getAppConfigByName: jest.fn().mockResolvedValue(createMockAppConfig(MOCK_SECRET)),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
      verify: jest.fn().mockReturnValue({
        username: 'teacher',
        filePath: '/docs/test.docx',
        share: 'default',
        origin: 'https://example.com',
        jti: 'uuid',
      }),
    };

    webdavService = {
      getClient: jest.fn().mockResolvedValue({}),
    };

    webdavSharesService = {
      getWebdavShareFromCache: jest.fn().mockResolvedValue({
        pathname: '/webdav',
        url: 'https://webdav.example.com/webdav',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaboraService,
        { provide: AppConfigService, useValue: appConfigService },
        { provide: JwtService, useValue: jwtService },
        { provide: WebdavService, useValue: webdavService },
        { provide: WebdavSharesService, useValue: webdavSharesService },
      ],
    }).compile();

    service = module.get<CollaboraService>(CollaboraService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateWopiToken', () => {
    it('should return an access token and TTL', async () => {
      const before = Date.now();
      const result = await service.generateWopiToken('teacher', '/docs/test.docx', 'default', 'https://example.com');

      expect(result.accessToken).toBe('signed-token');
      expect(result.accessTokenTTL).toBeGreaterThanOrEqual(before + WOPI_TOKEN_TTL_MS);
      expect(result.accessTokenTTL).toBeLessThanOrEqual(Date.now() + WOPI_TOKEN_TTL_MS);
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'teacher',
          filePath: '/docs/test.docx',
          share: 'default',
          origin: 'https://example.com',
          jti: expect.any(String),
        }),
        expect.objectContaining({ secret: MOCK_SECRET, expiresIn: WOPI_TOKEN_EXPIRY }),
      );
    });

    it('should throw BadRequestException for path traversal', async () => {
      await expect(
        service.generateWopiToken('teacher', '/docs/../etc/passwd', 'default', 'https://example.com'),
      ).rejects.toMatchObject({
        message: PathValidationErrorMessages.PathTraversal,
      });
    });

    it('should throw when WOPI secret is not configured', async () => {
      appConfigService.getAppConfigByName.mockResolvedValue(createMockAppConfig());

      await expect(
        service.generateWopiToken('teacher', '/docs/test.docx', 'default', 'https://example.com'),
      ).rejects.toMatchObject({
        message: FileSharingErrorMessage.AppNotProperlyConfigured,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });

    it('should throw when appConfig is null', async () => {
      appConfigService.getAppConfigByName.mockResolvedValue(null);

      await expect(
        service.generateWopiToken('teacher', '/docs/test.docx', 'default', 'https://example.com'),
      ).rejects.toMatchObject({
        message: FileSharingErrorMessage.AppNotProperlyConfigured,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('getFileStat', () => {
    it('should return the first file from webdav response', async () => {
      const mockFile = { basename: 'test.docx', size: 2048, etag: 'etag-abc' };
      jest.spyOn(WebdavService, 'executeWebdavRequest').mockResolvedValue([mockFile]);
      jest.spyOn(WebdavService, 'safeJoinUrl').mockReturnValue('https://webdav.example.com/docs/test.docx');

      const result = await service.getFileStat('teacher', '/docs/test.docx', 'default');

      expect(result).toEqual(mockFile);
      expect(webdavService.getClient).toHaveBeenCalledWith('teacher', 'default');
      expect(webdavSharesService.getWebdavShareFromCache).toHaveBeenCalledWith('default');
    });

    it('should return undefined when webdav returns empty array', async () => {
      jest.spyOn(WebdavService, 'executeWebdavRequest').mockResolvedValue([]);
      jest.spyOn(WebdavService, 'safeJoinUrl').mockReturnValue('https://webdav.example.com/docs/test.docx');

      const result = await service.getFileStat('teacher', '/docs/test.docx', 'default');

      expect(result).toBeUndefined();
    });

    it('should return undefined when webdav request fails', async () => {
      webdavService.getClient.mockRejectedValue(new Error('connection failed'));

      const result = await service.getFileStat('teacher', '/docs/test.docx', 'default');

      expect(result).toBeUndefined();
    });

    it('should normalize file path without leading slash', async () => {
      jest.spyOn(WebdavService, 'executeWebdavRequest').mockResolvedValue([{ basename: 'test.docx' }]);
      jest.spyOn(WebdavService, 'safeJoinUrl').mockReturnValue('https://webdav.example.com/docs/test.docx');

      await service.getFileStat('teacher', 'docs/test.docx', 'default');

      expect(webdavService.getClient).toHaveBeenCalledWith('teacher', 'default');
    });

    it('should keep file path that already starts with slash', async () => {
      jest.spyOn(WebdavService, 'executeWebdavRequest').mockResolvedValue([{ basename: 'test.docx' }]);
      jest.spyOn(WebdavService, 'safeJoinUrl').mockReturnValue('https://webdav.example.com/docs/test.docx');

      await service.getFileStat('teacher', '/docs/test.docx', 'default');

      expect(webdavService.getClient).toHaveBeenCalledWith('teacher', 'default');
    });
  });

  describe('validateWopiToken', () => {
    it('should return token payload when token is valid', async () => {
      const result = await service.validateWopiToken('valid-token');

      expect(result.username).toBe('teacher');
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token', { secret: MOCK_SECRET });
    });

    it('should throw UNAUTHORIZED when token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.validateWopiToken('invalid-token')).rejects.toMatchObject({
        message: FileSharingErrorMessage.WopiTokenInvalid,
        status: HttpStatus.UNAUTHORIZED,
      });
    });

    it('should throw when WOPI secret is not configured', async () => {
      appConfigService.getAppConfigByName.mockResolvedValue(createMockAppConfig());

      await expect(service.validateWopiToken('some-token')).rejects.toMatchObject({
        message: FileSharingErrorMessage.AppNotProperlyConfigured,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });
});
