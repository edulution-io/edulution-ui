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

/* eslint-disable @typescript-eslint/dot-notation */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpStatus } from '@nestjs/common';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import AuthService from './auth.service';
import { User } from '../users/user.schema';
import SseService from '../sse/sse.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

describe(AuthService.name, () => {
  let service: AuthService;
  let userModel: Record<string, jest.Mock>;
  let sseService: Record<string, jest.Mock>;
  let globalSettingsService: Record<string, jest.Mock>;
  let mockKeycloakApi: Record<string, jest.Mock>;

  beforeEach(async () => {
    userModel = {
      findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
      findOneAndUpdate: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
    };

    sseService = {
      subscribe: jest.fn(),
      getUserConnection: jest.fn().mockReturnValue(true),
      sendEventToUser: jest.fn(),
    };

    globalSettingsService = {
      getAdminGroupsFromCache: jest.fn().mockResolvedValue([]),
    };

    mockKeycloakApi = {
      post: jest.fn().mockResolvedValue({ data: { access_token: 'token' } }),
      get: jest.fn().mockResolvedValue({ data: {} }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: SseService, useValue: sseService },
        { provide: GlobalSettingsService, useValue: globalSettingsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    service['keycloakApi'] = mockKeycloakApi as never;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticateUser', () => {
    it('should delegate to signin for refresh_token grant type', async () => {
      const body = { grant_type: 'refresh_token', refresh_token: 'rt-1' } as never;

      await service.authenticateUser(body);

      expect(mockKeycloakApi.post).toHaveBeenCalled();
    });

    it('should signin with decoded password when user not found', async () => {
      const encodedPassword = Buffer.from('password123').toString('base64');
      const body = {
        grant_type: 'password',
        username: 'testuser',
        password: encodedPassword,
      } as never;

      await service.authenticateUser(body);

      expect(userModel.findOne).toHaveBeenCalled();
      expect(mockKeycloakApi.post).toHaveBeenCalled();
    });

    it('should signin without MFA when user has mfaEnabled=false', async () => {
      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ username: 'testuser', mfaEnabled: false }),
      });
      const encodedPassword = Buffer.from('password123').toString('base64');
      const body = {
        grant_type: 'password',
        username: 'testuser',
        password: encodedPassword,
      } as never;

      await service.authenticateUser(body);

      expect(mockKeycloakApi.post).toHaveBeenCalled();
    });

    it('should throw TotpMissing when MFA enabled but no TOTP in password', async () => {
      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ username: 'testuser', mfaEnabled: true, totpSecret: 'secret' }),
      });
      const encodedPassword = Buffer.from('password123').toString('base64');
      const body = {
        grant_type: 'password',
        username: 'testuser',
        password: encodedPassword,
      } as never;

      await expect(service.authenticateUser(body)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });
    });
  });

  describe('getQrCode', () => {
    it('should return a base64-encoded OTP auth string', () => {
      const result = service.getQrCode('testuser');

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('setupTotp', () => {
    it('should throw when TOTP validation fails', async () => {
      jest.spyOn(AuthService, 'checkTotp').mockReturnValue(false);

      await expect(service.setupTotp('testuser', { totp: '123456', secret: 'secret' })).rejects.toMatchObject({
        message: AuthErrorMessages.TotpInvalid,
        status: HttpStatus.UNAUTHORIZED,
      });
    });

    it('should update user when TOTP is valid', async () => {
      jest.spyOn(AuthService, 'checkTotp').mockReturnValue(true);
      const updatedUser = { username: 'testuser', mfaEnabled: true };
      userModel.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(updatedUser) });

      const result = await service.setupTotp('testuser', { totp: '123456', secret: 'secret' });

      expect(result).toEqual(updatedUser);
      expect(userModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('getTotpInfo', () => {
    it('should return false when user not found', async () => {
      const result = await service.getTotpInfo('unknown');

      expect(result).toBe(false);
    });

    it('should return mfaEnabled status when user found', async () => {
      userModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ mfaEnabled: true }) });

      const result = await service.getTotpInfo('testuser');

      expect(result).toBe(true);
    });

    it('should query by email when identifier contains @', async () => {
      userModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ mfaEnabled: false }) });

      await service.getTotpInfo('user@test.com');

      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'user@test.com' }, { mfaEnabled: 1 });
    });
  });

  describe('disableTotp', () => {
    it('should unset MFA fields for user', async () => {
      userModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ username: 'testuser', mfaEnabled: false }),
      });

      const result = await service.disableTotp('testuser');

      expect(result).toBeDefined();
      expect(userModel.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND on DB failure', async () => {
      userModel.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('DB error')) });

      await expect(service.disableTotp('testuser')).rejects.toMatchObject({
        message: UserErrorMessages.NotFoundError,
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('disableTotpForUser', () => {
    it('should throw NOT_FOUND when username is empty', async () => {
      await expect(service.disableTotpForUser('', [])).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw UNAUTHORIZED when user is a student', async () => {
      await expect(service.disableTotpForUser('testuser', ['/role-student'])).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });
    });
  });

  describe('loginViaApp', () => {
    it('should send SSE event when connection is active', () => {
      service.loginViaApp({ username: 'user', password: 'pass' } as never, 'session-1');

      expect(sseService.getUserConnection).toHaveBeenCalledWith('session-1');
      expect(sseService.sendEventToUser).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND when connection is not active', () => {
      sseService.getUserConnection.mockReturnValue(null);

      expect(() => {
        service.loginViaApp({ username: 'user', password: 'pass' } as never, 'session-1');
      }).toThrow();
    });
  });

  describe('checkTotp', () => {
    it('should return boolean', () => {
      const result = AuthService.checkTotp('000000', 'testuser', 'JBSWY3DPEHPK3PXP');

      expect(typeof result).toBe('boolean');
    });
  });
});
