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
import { createMockExecutionContext } from '@libs/test-utils/api-mocks';
import LocalhostGuard from './localhost.guard';

describe(LocalhostGuard.name, () => {
  let guard: LocalhostGuard;

  beforeEach(() => {
    guard = new LocalhostGuard();
  });

  it('should allow request from 127.0.0.1', () => {
    const context = createMockExecutionContext({ ip: '127.0.0.1' });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow request from IPv6 localhost (::1)', () => {
    const context = createMockExecutionContext({ ip: '::1' });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow request from IPv4-mapped IPv6 localhost (::ffff:127.0.0.1)', () => {
    const context = createMockExecutionContext({ ip: '::ffff:127.0.0.1' });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should deny request from remote IP 192.168.1.100', () => {
    const context = createMockExecutionContext({ ip: '192.168.1.100' });

    expect(() => guard.canActivate(context)).toThrow();
    try {
      guard.canActivate(context);
    } catch (error) {
      expect((error as { status: number }).status).toBe(HttpStatus.UNAUTHORIZED);
    }
  });

  it('should deny request from external IP 10.0.0.1', () => {
    const context = createMockExecutionContext({ ip: '10.0.0.1' });

    expect(() => guard.canActivate(context)).toThrow();
  });

  it('should deny request from public IP', () => {
    const context = createMockExecutionContext({ ip: '8.8.8.8' });

    expect(() => guard.canActivate(context)).toThrow();
  });
});
