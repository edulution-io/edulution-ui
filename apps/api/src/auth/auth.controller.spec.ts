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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus } from '@nestjs/common';
import AuthController from './auth.controller';
import AuthService from './auth.service';

describe(AuthController.name, () => {
  let controller: AuthController;
  let authService: Record<string, jest.Mock>;

  beforeEach(async () => {
    authService = {
      authconfig: jest.fn().mockReturnValue({ authorization_endpoint: 'http://test' }),
      authenticateUser: jest.fn().mockResolvedValue({ access_token: 'token' }),
      getQrCode: jest.fn().mockReturnValue('base64qrcode'),
      setupTotp: jest.fn().mockResolvedValue({ username: 'testuser', mfaEnabled: true }),
      getTotpInfo: jest.fn().mockResolvedValue(false),
      disableTotp: jest.fn().mockResolvedValue({ username: 'testuser', mfaEnabled: false }),
      disableTotpForUser: jest.fn().mockResolvedValue({ success: true, status: HttpStatus.OK }),
      loginViaApp: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('authenticate', () => {
    it('should delegate to authService.authenticateUser', async () => {
      const body = { grant_type: 'password', username: 'user', password: 'pass' } as never;
      await controller.authenticate(body);
      expect(authService.authenticateUser).toHaveBeenCalledWith(body);
    });
  });

  describe('getQrCode', () => {
    it('should delegate to authService.getQrCode', () => {
      const result = controller.getQrCode('testuser');
      expect(authService.getQrCode).toHaveBeenCalledWith('testuser');
      expect(result).toBe('base64qrcode');
    });
  });

  describe('setupTotp', () => {
    it('should delegate to authService.setupTotp', async () => {
      const body = { totp: '123456', secret: 'secret' };
      await controller.setupTotp('testuser', body);
      expect(authService.setupTotp).toHaveBeenCalledWith('testuser', body);
    });
  });

  describe('getTotpInfo', () => {
    it('should delegate to authService.getTotpInfo', async () => {
      await controller.getTotpInfo({ username: 'testuser' });
      expect(authService.getTotpInfo).toHaveBeenCalledWith('testuser');
    });
  });

  describe('disableTotp', () => {
    it('should delegate to authService.disableTotp', async () => {
      await controller.disableTotp('testuser');
      expect(authService.disableTotp).toHaveBeenCalledWith('testuser');
    });
  });

  describe('disableTotpForUser', () => {
    it('should delegate to authService.disableTotpForUser', async () => {
      await controller.disableTotpForUser('admin', ['/teachers'], { username: 'student1' });
      expect(authService.disableTotpForUser).toHaveBeenCalledWith('student1', ['/teachers']);
    });
  });

  describe('loginViaApp', () => {
    it('should delegate to authService.loginViaApp with body and sessionId', () => {
      const body = { username: 'user', password: 'pass' } as never;
      controller.loginViaApp(body, 'session-1');
      expect(authService.loginViaApp).toHaveBeenCalledWith(body, 'session-1');
    });

    it('should throw BAD_REQUEST when sessionId is missing', () => {
      const body = { username: 'user', password: 'pass' } as never;
      expect(() => controller.loginViaApp(body, '')).toThrow();
    });
  });
});
