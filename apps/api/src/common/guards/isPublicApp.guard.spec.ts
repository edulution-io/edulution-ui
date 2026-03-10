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

import { createMockExecutionContext } from '@libs/test-utils/api-mocks';
import IsPublicAppGuard from './isPublicApp.guard';
import AppConfigService from '../../appconfig/appconfig.service';

describe(IsPublicAppGuard.name, () => {
  let guard: IsPublicAppGuard;
  let appConfigService: AppConfigService;

  beforeEach(() => {
    appConfigService = {
      getPublicAppConfigByName: jest.fn(),
    } as unknown as AppConfigService;

    guard = new IsPublicAppGuard(appConfigService);
  });

  it('should return true for a public app', async () => {
    (appConfigService.getPublicAppConfigByName as jest.Mock).mockResolvedValue({ name: 'public-app' });

    const context = createMockExecutionContext({ params: { appName: 'public-app' } });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(appConfigService.getPublicAppConfigByName).toHaveBeenCalledWith('public-app');
  });

  it('should return false for a non-public app', async () => {
    (appConfigService.getPublicAppConfigByName as jest.Mock).mockResolvedValue(null);

    const context = createMockExecutionContext({ params: { appName: 'private-app' } });
    const result = await guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should return false when app config returns undefined', async () => {
    (appConfigService.getPublicAppConfigByName as jest.Mock).mockResolvedValue(undefined);

    const context = createMockExecutionContext({ params: { appName: 'unknown-app' } });
    const result = await guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should pass the appName from route params to the service', async () => {
    (appConfigService.getPublicAppConfigByName as jest.Mock).mockResolvedValue({ name: 'test-app' });

    const context = createMockExecutionContext({ params: { appName: 'test-app' } });
    await guard.canActivate(context);

    expect(appConfigService.getPublicAppConfigByName).toHaveBeenCalledWith('test-app');
  });
});
