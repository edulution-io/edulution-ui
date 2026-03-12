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

import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import eduApi from '@/api/eduApi';
import type UserDto from '@libs/user/types/user.dto';
import type AppConfigOption from '@libs/appconfig/types/appConfigOption';

describe('MSW Infrastructure', () => {
  it('should intercept eduApi calls with server.use() override', async () => {
    const testData = { message: 'MSW infrastructure working' };

    server.use(http.get('/edu-api/test-endpoint', () => HttpResponse.json(testData)));

    const response = await eduApi.get<{ message: string }>('/test-endpoint');

    expect(response.data).toEqual(testData);
  });

  it('should use default auth handler from vitest.setup.ts', async () => {
    const response = await eduApi.get<UserDto>('/auth/userinfo');

    expect(response.data).toBeDefined();
    expect(response.data.username).toBe('max.mustermann');
    expect(response.data.email).toBe('max.mustermann@realschule-musterstadt.de');
  });

  it('should use default appconfig handler', async () => {
    const response = await eduApi.get<AppConfigOption[]>('/appconfig');

    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0].id).toBe('filesharing');
  });
});
