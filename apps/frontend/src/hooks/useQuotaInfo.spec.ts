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

const { mockFetchUsersQuota, lmnState, userState } = vi.hoisted(() => ({
  mockFetchUsersQuota: vi.fn(),
  lmnState: {
    user: null as { school?: string; sophomorixMailQuotaCalculated?: string[] } | null,
    lmnApiToken: null as string | null,
    usersQuota: null as Record<string, { used: number; soft_limit: number; hard_limit: number }> | null,
  },
  userState: {
    user: null as { username?: string } | null,
  },
}));

vi.mock('@/store/useLmnApiStore', () => {
  const hook = () => ({ ...lmnState, fetchUsersQuota: mockFetchUsersQuota });
  hook.getState = () => ({ ...lmnState, fetchUsersQuota: mockFetchUsersQuota });
  return { default: hook };
});

vi.mock('@/store/UserStore/useUserStore', () => {
  const hook = () => ({ ...userState });
  hook.getState = () => ({ ...userState });
  return { default: hook };
});

import { renderHook } from '@testing-library/react';
import DEFAULT_SCHOOL from '@libs/lmnApi/constants/defaultSchool';
import useQuotaInfo from './useQuotaInfo';

describe('useQuotaInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lmnState.user = null;
    lmnState.lmnApiToken = null;
    lmnState.usersQuota = null;
    userState.user = null;
  });

  it('returns loading state with dashes when no quota data exists', () => {
    const { result } = renderHook(() => useQuotaInfo());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.quotaUsed).toBe('--');
    expect(result.current.quotaHardLimit).toBe('--');
    expect(result.current.quotaUsedInGb).toBe('--');
    expect(result.current.quotaHardLimitInGb).toBe('--');
    expect(result.current.mailQuota).toBe('--');
    expect(result.current.percentageUsed).toBe(0);
  });

  it('returns formatted quota data when quota exists', () => {
    lmnState.user = { school: DEFAULT_SCHOOL, sophomorixMailQuotaCalculated: ['500M'] };
    lmnState.lmnApiToken = 'token';
    lmnState.usersQuota = {
      [DEFAULT_SCHOOL]: { used: 1024, soft_limit: 5120, hard_limit: 10240 },
    };

    const { result } = renderHook(() => useQuotaInfo());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.quotaUsed).toBe(1024);
    expect(result.current.quotaHardLimit).toBe(10240);
    expect(result.current.percentageUsed).toBe(10);
    expect(result.current.mailQuota).toBe('500M');
  });

  it('fetches quota when lmnApiToken and username are set and no external params provided', () => {
    lmnState.lmnApiToken = 'token';
    userState.user = { username: 'testuser' };

    renderHook(() => useQuotaInfo());

    expect(mockFetchUsersQuota).toHaveBeenCalledWith('testuser');
  });

  it('does not fetch quota when external user is provided', () => {
    lmnState.lmnApiToken = 'token';
    userState.user = { username: 'testuser' };

    const externalUser = { school: DEFAULT_SCHOOL } as never;

    renderHook(() => useQuotaInfo(externalUser));

    expect(mockFetchUsersQuota).not.toHaveBeenCalled();
  });

  it('does not fetch quota when external quota is provided', () => {
    lmnState.lmnApiToken = 'token';
    userState.user = { username: 'testuser' };

    const externalQuota = {
      [DEFAULT_SCHOOL]: { used: 512, soft_limit: 2048, hard_limit: 4096 },
    };

    renderHook(() => useQuotaInfo(undefined, externalQuota));

    expect(mockFetchUsersQuota).not.toHaveBeenCalled();
  });

  it('uses external user and quota when provided', () => {
    const externalUser = {
      school: 'custom-school',
      sophomorixMailQuotaCalculated: ['1G'],
    } as never;

    const externalQuota = {
      'custom-school': { used: 2048, soft_limit: 8192, hard_limit: 10240 },
    };

    const { result } = renderHook(() => useQuotaInfo(externalUser, externalQuota));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.quotaUsed).toBe(2048);
    expect(result.current.quotaHardLimit).toBe(10240);
    expect(result.current.mailQuota).toBe('1G');
    expect(result.current.percentageUsed).toBe(20);
  });

  it('uses default-school when user has no school set', () => {
    lmnState.user = { sophomorixMailQuotaCalculated: ['200M'] };
    lmnState.lmnApiToken = 'token';
    lmnState.usersQuota = {
      [DEFAULT_SCHOOL]: { used: 512, soft_limit: 2048, hard_limit: 4096 },
    };

    const { result } = renderHook(() => useQuotaInfo());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.quotaUsed).toBe(512);
  });

  it('returns green progress bar color for low usage', () => {
    lmnState.user = { school: DEFAULT_SCHOOL };
    lmnState.lmnApiToken = 'token';
    lmnState.usersQuota = {
      [DEFAULT_SCHOOL]: { used: 100, soft_limit: 5000, hard_limit: 10000 },
    };

    const { result } = renderHook(() => useQuotaInfo());

    expect(result.current.progressBarColor).toBe('bg-ciLightGreen');
  });
});
