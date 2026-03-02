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

const {
  mockGetAppConfigs,
  mockGetPublicAppConfigs,
  mockGetGlobalSettings,
  mockGetIsEduApiHealthy,
  mockFetchWebdavShares,
  mockFetchAndInitSentry,
} = vi.hoisted(() => ({
  mockGetAppConfigs: vi.fn(),
  mockGetPublicAppConfigs: vi.fn(),
  mockGetGlobalSettings: vi.fn(),
  mockGetIsEduApiHealthy: vi.fn().mockResolvedValue(true),
  mockFetchWebdavShares: vi.fn(),
  mockFetchAndInitSentry: vi.fn(),
}));

vi.mock('@/pages/Settings/AppConfig/useAppConfigsStore', () => {
  const hook = () => ({
    getAppConfigs: mockGetAppConfigs,
    getPublicAppConfigs: mockGetPublicAppConfigs,
  });
  hook.getState = () => ({
    getAppConfigs: mockGetAppConfigs,
    getPublicAppConfigs: mockGetPublicAppConfigs,
  });
  return { default: hook };
});

vi.mock('@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore', () => {
  const hook = () => ({
    getGlobalSettings: mockGetGlobalSettings,
  });
  hook.getState = () => ({ getGlobalSettings: mockGetGlobalSettings });
  return { default: hook };
});

vi.mock('@/store/EduApiStore/useEduApiStore', () => {
  const hook = () => ({
    getIsEduApiHealthy: mockGetIsEduApiHealthy,
  });
  hook.getState = () => ({ getIsEduApiHealthy: mockGetIsEduApiHealthy });
  return { default: hook };
});

vi.mock('@/pages/FileSharing/useFileSharingStore', () => {
  const hook = () => ({
    fetchWebdavShares: mockFetchWebdavShares,
  });
  hook.getState = () => ({ fetchWebdavShares: mockFetchWebdavShares });
  return { default: hook };
});

vi.mock('@/store/useSentryStore', () => {
  const hook = (selector: (s: { fetchAndInitSentry: typeof mockFetchAndInitSentry }) => unknown) =>
    selector({ fetchAndInitSentry: mockFetchAndInitSentry });
  hook.getState = () => ({ fetchAndInitSentry: mockFetchAndInitSentry });
  return { default: hook };
});

import { renderHook, waitFor } from '@testing-library/react';
import useInitialAppData from './useInitialAppData';

describe('useInitialAppData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetIsEduApiHealthy.mockResolvedValue(true);
  });

  it('always fetches public app configs regardless of auth state', () => {
    renderHook(() => useInitialAppData(false));

    expect(mockGetPublicAppConfigs).toHaveBeenCalled();
  });

  it('does not fetch protected data when not authenticated', () => {
    renderHook(() => useInitialAppData(false));

    expect(mockGetIsEduApiHealthy).not.toHaveBeenCalled();
    expect(mockGetAppConfigs).not.toHaveBeenCalled();
    expect(mockGetGlobalSettings).not.toHaveBeenCalled();
    expect(mockFetchWebdavShares).not.toHaveBeenCalled();
    expect(mockFetchAndInitSentry).not.toHaveBeenCalled();
  });

  it('fetches all initial data when authenticated and API is healthy', async () => {
    renderHook(() => useInitialAppData(true));

    await waitFor(() => {
      expect(mockGetIsEduApiHealthy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockGetGlobalSettings).toHaveBeenCalled();
      expect(mockGetAppConfigs).toHaveBeenCalled();
      expect(mockFetchWebdavShares).toHaveBeenCalled();
      expect(mockFetchAndInitSentry).toHaveBeenCalled();
    });
  });

  it('does not fetch data when API is not healthy', async () => {
    mockGetIsEduApiHealthy.mockResolvedValue(false);

    renderHook(() => useInitialAppData(true));

    await waitFor(() => {
      expect(mockGetIsEduApiHealthy).toHaveBeenCalled();
    });

    expect(mockGetAppConfigs).not.toHaveBeenCalled();
    expect(mockGetGlobalSettings).not.toHaveBeenCalled();
    expect(mockFetchWebdavShares).not.toHaveBeenCalled();
    expect(mockFetchAndInitSentry).not.toHaveBeenCalled();
  });

  it('fetches data when transitioning from unauthenticated to authenticated', async () => {
    const { rerender } = renderHook(({ isAuth }) => useInitialAppData(isAuth), {
      initialProps: { isAuth: false },
    });

    expect(mockGetIsEduApiHealthy).not.toHaveBeenCalled();

    rerender({ isAuth: true });

    await waitFor(() => {
      expect(mockGetIsEduApiHealthy).toHaveBeenCalled();
    });
  });
});
