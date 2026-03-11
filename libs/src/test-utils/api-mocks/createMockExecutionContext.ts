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

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { ExecutionContext } from '@nestjs/common';
import JwtUser from '@libs/user/types/jwt/jwtUser';

interface MockExecutionContextOverrides {
  user?: Partial<JwtUser>;
  token?: string;
  ip?: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  handler?: Record<string, unknown>;
  classMetadata?: Record<string, unknown>;
}

const createMockExecutionContext = (overrides: MockExecutionContextOverrides = {}): ExecutionContext => {
  const mockRequest = {
    user: overrides.user as JwtUser | undefined,
    token: overrides.token,
    ip: overrides.ip ?? '127.0.0.1',
    socket: { remoteAddress: overrides.ip ?? '127.0.0.1' },
    params: overrides.params ?? {},
    query: overrides.query ?? {},
    headers: {
      authorization: overrides.token ? `Bearer ${overrides.token}` : undefined,
      cookie: '',
      ...overrides.headers,
    },
  };

  const mockHandler = jest.fn();
  const mockClass = jest.fn();

  return {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
      getResponse: () => ({}),
      getNext: () => jest.fn(),
    }),
    getHandler: () => mockHandler,
    getClass: () => mockClass,
    getType: () => 'http',
    getArgs: () => [mockRequest],
    getArgByIndex: (index: number) => [mockRequest][index],
    switchToRpc: () => ({ getContext: jest.fn(), getData: jest.fn() }),
    switchToWs: () => ({ getClient: jest.fn(), getData: jest.fn(), getPattern: jest.fn() }),
  } as unknown as ExecutionContext;
};

export default createMockExecutionContext;
