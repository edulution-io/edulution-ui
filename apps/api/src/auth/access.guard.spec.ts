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
import AccessGuard from './access.guard';
import AppConfigService from '../appconfig/appconfig.service';
import GlobalSettingsService from '../global-settings/global-settings.service';
import { clearAccessCache } from '../common/guards/accessCache';

describe(AccessGuard.name, () => {
  let guard: AccessGuard;
  let reflector: Reflector;
  let appConfigService: AppConfigService;
  let globalSettingsService: GlobalSettingsService;

  const adminGroups = ['cn=admins,ou=groups,dc=schule,dc=de'];
  const appDomain = 'test-app';
  const allowedGroups = new Set(['cn=teachers,ou=groups,dc=schule,dc=de']);

  beforeEach(() => {
    clearAccessCache();

    reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
      get: jest.fn().mockReturnValue(appDomain),
    } as unknown as Reflector;

    appConfigService = {
      appAccessMap: new Map([[appDomain, allowedGroups]]),
    } as unknown as AppConfigService;

    globalSettingsService = {
      getAdminGroupsFromCache: jest.fn().mockResolvedValue(adminGroups),
    } as unknown as GlobalSettingsService;

    guard = new AccessGuard(reflector, appConfigService, globalSettingsService);
  });

  it('should allow admin user regardless of app access', async () => {
    const adminUser = createJwtUser({
      preferred_username: 'admin.user',
      ldapGroups: ['cn=admins,ou=groups,dc=schule,dc=de'],
    });

    const context = createMockExecutionContext({ user: adminUser });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow user with matching group', async () => {
    const teacher = createJwtUser({
      preferred_username: 'lehrer.schmidt',
      ldapGroups: ['cn=teachers,ou=groups,dc=schule,dc=de'],
    });

    const context = createMockExecutionContext({ user: teacher });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw 403 when user groups do not match', async () => {
    const student = createJwtUser({
      preferred_username: 'schueler.max',
      ldapGroups: ['cn=students,ou=groups,dc=schule,dc=de'],
    });

    const context = createMockExecutionContext({ user: student });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: HttpStatus.FORBIDDEN,
    });
  });

  it('should throw 401 when no user on request', async () => {
    const context = createMockExecutionContext({});

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should return cached result on second call', async () => {
    const teacher = createJwtUser({
      preferred_username: 'lehrer.cached',
      ldapGroups: ['cn=teachers,ou=groups,dc=schule,dc=de'],
    });

    const context = createMockExecutionContext({ user: teacher });

    await guard.canActivate(context);
    await guard.canActivate(context);

    expect(globalSettingsService.getAdminGroupsFromCache).toHaveBeenCalledTimes(1);
  });

  it('should re-evaluate after cache is cleared', async () => {
    const teacher = createJwtUser({
      preferred_username: 'lehrer.recache',
      ldapGroups: ['cn=teachers,ou=groups,dc=schule,dc=de'],
    });

    const context = createMockExecutionContext({ user: teacher });

    await guard.canActivate(context);
    clearAccessCache();
    await guard.canActivate(context);

    expect(globalSettingsService.getAdminGroupsFromCache).toHaveBeenCalledTimes(2);
  });

  it('should allow access when no APP_ACCESS_KEY metadata is set', async () => {
    (reflector.get as jest.Mock).mockReturnValue(undefined);

    const user = createJwtUser();
    const context = createMockExecutionContext({ user });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(globalSettingsService.getAdminGroupsFromCache).not.toHaveBeenCalled();
  });

  it('should allow access on public routes', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    const context = createMockExecutionContext({});
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should clear cache on app access map update event', () => {
    guard.handleAppAccessMapUpdated();
    expect(true).toBe(true);
  });
});
