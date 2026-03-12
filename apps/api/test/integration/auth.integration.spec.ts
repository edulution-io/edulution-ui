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

import { INestApplication, HttpStatus, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector, APP_GUARD } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import request from 'supertest';
import { PUBLIC_ROUTE_KEY } from '@libs/auth/constants/appAccessKeys';
import AUTH_PATHS from '@libs/auth/constants/auth-paths';
import AuthController from '../../src/auth/auth.controller';
import AuthService from '../../src/auth/auth.service';
import { TEST_USER, MockAccessGuard } from './createTestApp';

@Injectable()
class TestableAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(PUBLIC_ROUTE_KEY, context.getHandler());
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (authHeader === 'Bearer valid-test-token') {
      req.user = TEST_USER;
      req.token = 'valid-test-token';
      return true;
    }

    if (isPublic) {
      return true;
    }

    return false;
  }
}

const BASE = `/edu-api/${AUTH_PATHS.AUTH_ENDPOINT}`;

describe('Auth Integration', () => {
  let app: INestApplication;
  let authService: Record<string, jest.Mock>;

  beforeAll(async () => {
    authService = {
      authenticateUser: jest.fn().mockResolvedValue({ access_token: 'new-token', token_type: 'Bearer' }),
      authconfig: jest.fn().mockReturnValue({
        toPromise: jest.fn(),
        subscribe: jest.fn(),
        pipe: jest.fn().mockReturnThis(),
      }),
      getQrCode: jest.fn().mockReturnValue('base64-qr-string'),
      setupTotp: jest.fn().mockResolvedValue({ username: 'testuser', mfaEnabled: true }),
      getTotpInfo: jest.fn().mockResolvedValue(false),
      disableTotp: jest.fn().mockResolvedValue({ username: 'testuser', mfaEnabled: false }),
      disableTotpForUser: jest.fn().mockResolvedValue({ success: true, status: HttpStatus.OK }),
      loginViaApp: jest.fn(),
    };

    const moduleFixture = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        {
          provide: APP_GUARD,
          useClass: TestableAuthGuard,
        },
        { provide: APP_GUARD, useValue: new MockAccessGuard() },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn() } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('edu-api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Public routes (no auth required)', () => {
    it('POST /edu-api/auth - authenticate user', async () => {
      const body = { grant_type: 'password', username: 'testuser', password: 'encoded-pass' };

      const response = await request(app.getHttpServer()).post(BASE).send(body);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toEqual({ access_token: 'new-token', token_type: 'Bearer' });
      expect(authService.authenticateUser).toHaveBeenCalledWith(body);
    });

    it('GET /edu-api/auth/totp/:username - get TOTP info without auth', async () => {
      const response = await request(app.getHttpServer()).get(`${BASE}/${AUTH_PATHS.AUTH_CHECK_TOTP}/testuser`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(authService.getTotpInfo).toHaveBeenCalledWith('testuser');
    });

    it('POST /edu-api/auth/edu-app - login via app without auth', async () => {
      const response = await request(app.getHttpServer())
        .post(`${BASE}/${AUTH_PATHS.AUTH_VIA_APP}?sessionId=session-1`)
        .send({ username: 'user', password: 'pass' });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(authService.loginViaApp).toHaveBeenCalled();
    });
  });

  describe('Protected routes (auth required)', () => {
    it('GET /edu-api/auth/qrcode - returns 403 without auth', async () => {
      const response = await request(app.getHttpServer()).get(`${BASE}/${AUTH_PATHS.AUTH_QRCODE}`);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('GET /edu-api/auth/qrcode - returns QR code with auth', async () => {
      const response = await request(app.getHttpServer())
        .get(`${BASE}/${AUTH_PATHS.AUTH_QRCODE}`)
        .set('Authorization', 'Bearer valid-test-token');

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.text).toContain('base64-qr-string');
    });

    it('POST /edu-api/auth/totp - setup TOTP with auth', async () => {
      const body = { totp: '123456', secret: 'test-secret' };

      const response = await request(app.getHttpServer())
        .post(`${BASE}/${AUTH_PATHS.AUTH_CHECK_TOTP}`)
        .set('Authorization', 'Bearer valid-test-token')
        .send(body);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(authService.setupTotp).toHaveBeenCalledWith('testuser', body);
    });

    it('POST /edu-api/auth/totp - returns 403 without auth', async () => {
      const response = await request(app.getHttpServer())
        .post(`${BASE}/${AUTH_PATHS.AUTH_CHECK_TOTP}`)
        .send({ totp: '123456', secret: 'test-secret' });

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('PUT /edu-api/auth/totp - disable own TOTP with auth', async () => {
      const response = await request(app.getHttpServer())
        .put(`${BASE}/${AUTH_PATHS.AUTH_CHECK_TOTP}`)
        .set('Authorization', 'Bearer valid-test-token');

      expect(response.status).toBe(HttpStatus.OK);
      expect(authService.disableTotp).toHaveBeenCalledWith('testuser');
    });

    it('PUT /edu-api/auth/totp/:username - disable TOTP for other user', async () => {
      const response = await request(app.getHttpServer())
        .put(`${BASE}/${AUTH_PATHS.AUTH_CHECK_TOTP}/otheruser`)
        .set('Authorization', 'Bearer valid-test-token');

      expect(response.status).toBe(HttpStatus.OK);
      expect(authService.disableTotpForUser).toHaveBeenCalledWith('otheruser', TEST_USER.ldapGroups);
    });
  });

  describe('Error handling', () => {
    it('POST /edu-api/auth - propagates service errors', async () => {
      authService.authenticateUser.mockRejectedValueOnce({
        status: HttpStatus.UNAUTHORIZED,
        response: { error: 'invalid_grant', error_description: 'Invalid credentials' },
        getStatus: () => HttpStatus.UNAUTHORIZED,
        getResponse: () => ({ error: 'invalid_grant', error_description: 'Invalid credentials' }),
      });

      const response = await request(app.getHttpServer())
        .post(BASE)
        .send({ grant_type: 'password', username: 'baduser', password: 'badpass' });

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
