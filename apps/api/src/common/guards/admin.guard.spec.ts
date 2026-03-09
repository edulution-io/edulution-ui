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
import { Reflector } from '@nestjs/core';
import { createMockExecutionContext, createJwtUser } from '@libs/test-utils/api-mocks';
import AdminGuard from './admin.guard';
import GlobalSettingsService from '../../global-settings/global-settings.service';

describe(AdminGuard.name, () => {
  let guard: AdminGuard;
  let globalSettingsService: GlobalSettingsService;
  let reflector: Reflector;

  const adminGroups = ['cn=admins,ou=groups,dc=schule,dc=de'];

  beforeEach(() => {
    globalSettingsService = {
      getAdminGroupsFromCache: jest.fn().mockResolvedValue(adminGroups),
    } as unknown as GlobalSettingsService;

    reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;

    guard = new AdminGuard(globalSettingsService, reflector);
  });

  it('should allow admin user', async () => {
    const adminUser = createJwtUser({
      ldapGroups: ['cn=admins,ou=groups,dc=schule,dc=de'],
    });

    const context = createMockExecutionContext({ user: adminUser });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw 401 for non-admin user', async () => {
    const normalUser = createJwtUser({
      ldapGroups: ['cn=teachers,ou=groups,dc=schule,dc=de'],
    });

    const context = createMockExecutionContext({ user: normalUser });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should throw 404 when no user on request', async () => {
    const context = createMockExecutionContext({});

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('should allow access on public routes without checking admin', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    const context = createMockExecutionContext({});
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(globalSettingsService.getAdminGroupsFromCache).not.toHaveBeenCalled();
  });

  it('should call getAdminGroupsFromCache with correct service', async () => {
    const adminUser = createJwtUser({
      ldapGroups: ['cn=admins,ou=groups,dc=schule,dc=de'],
    });

    const context = createMockExecutionContext({ user: adminUser });
    await guard.canActivate(context);

    expect(globalSettingsService.getAdminGroupsFromCache).toHaveBeenCalledTimes(1);
  });

  it('should handle user with empty ldapGroups array', async () => {
    const userNoGroups = createJwtUser({ ldapGroups: [] });

    const context = createMockExecutionContext({ user: userNoGroups });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });
});
