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
import { Reflector } from '@nestjs/core';
import { PUBLIC_ROUTE_KEY } from '@libs/auth/constants/appAccessKeys';
import { createMockExecutionContext, createJwtUser } from '@libs/test-utils/api-mocks';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import AuthGuard from './auth.guard';

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('fake-rsa-public-key'),
}));

describe(AuthGuard.name, () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  const mockUser = createJwtUser();

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as unknown as JwtService;

    reflector = {
      get: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;

    guard = new AuthGuard(jwtService, reflector);
  });

  it('should allow access with a valid token', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockUser);

    const context = createMockExecutionContext({ token: 'valid-jwt-token' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-jwt-token', {
      publicKey: 'fake-rsa-public-key',
      algorithms: ['RS256'],
    });

    const request = context.switchToHttp().getRequest<{ user: JwtUser; token: string }>();
    expect(request.user).toEqual(mockUser);
    expect(request.token).toBe('valid-jwt-token');
  });

  it('should throw UnauthorizedException when no token is provided on a protected route', async () => {
    const context = createMockExecutionContext({});

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should throw UnauthorizedException when token verification fails (expired token)', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('TokenExpiredError'));

    const context = createMockExecutionContext({ token: 'expired-jwt-token' });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should throw UnauthorizedException when token is malformed', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('jwt malformed'));

    const context = createMockExecutionContext({ token: 'not.a.jwt' });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should throw UnauthorizedException when token uses wrong algorithm', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('invalid algorithm'));

    const context = createMockExecutionContext({ token: 'wrong-algo-token' });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should allow access on public routes without a token', async () => {
    (reflector.get as jest.Mock).mockReturnValue(true);

    const context = createMockExecutionContext({});
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should allow access on public routes even when token verification fails', async () => {
    (reflector.get as jest.Mock).mockReturnValue(true);
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('TokenExpiredError'));

    const context = createMockExecutionContext({ token: 'expired-jwt-token' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should extract token from Bearer authorization header correctly', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockUser);

    const context = createMockExecutionContext({ token: 'extracted-token' });
    await guard.canActivate(context);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      'extracted-token',
      expect.objectContaining({ publicKey: 'fake-rsa-public-key' }),
    );
  });

  it('should check the PUBLIC_ROUTE_KEY metadata on the handler', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockUser);

    const context = createMockExecutionContext({ token: 'valid-jwt-token' });
    await guard.canActivate(context);

    expect(reflector.get).toHaveBeenCalledWith(PUBLIC_ROUTE_KEY, context.getHandler());
  });
});
