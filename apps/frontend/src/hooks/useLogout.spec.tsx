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

const { mockRemoveUser, mockLogout, mockRemoveCookie, mockSilentLogout, mockCleanAllStores, authState } = vi.hoisted(
  () => ({
    mockRemoveUser: vi.fn().mockResolvedValue(undefined),
    mockLogout: vi.fn().mockResolvedValue(undefined),
    mockRemoveCookie: vi.fn(),
    mockSilentLogout: vi.fn().mockResolvedValue(undefined),
    mockCleanAllStores: vi.fn().mockResolvedValue(undefined),
    authState: { user: { expired: false } as { expired: boolean } | null },
  }),
);

vi.mock('sonner', () => ({
  toast: {
    dismiss: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    removeUser: mockRemoveUser,
    user: authState.user,
  }),
}));

vi.mock('react-cookie', () => ({
  useCookies: () => [null, null, mockRemoveCookie],
}));

vi.mock('@/store/UserStore/useUserStore', () => ({
  default: () => ({ logout: mockLogout }),
}));

vi.mock('@/store/utils/cleanAllStores', () => ({
  default: mockCleanAllStores,
}));

vi.mock('@/pages/LoginPage/useSilentLoginWithPassword', () => ({
  default: () => ({ silentLogout: mockSilentLogout }),
}));

vi.mock('@/pages/Settings/AppConfig/useAppConfigsStore', () => {
  const hook = (selector: (s: { publicAppConfigs: null }) => unknown) => selector({ publicAppConfigs: null });
  hook.getState = () => ({ publicAppConfigs: null });
  return { default: hook };
});

import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';
import useLogout from './useLogout';

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { expired: false };
  });

  it('calls all cleanup steps in order', async () => {
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(mockRemoveUser).toHaveBeenCalled();
    expect(mockCleanAllStores).toHaveBeenCalled();
    expect(mockRemoveCookie).toHaveBeenCalled();
    expect(mockSilentLogout).toHaveBeenCalled();
    expect(toast.dismiss).toHaveBeenCalled();
  });

  it('shows success toast when token is not expired', async () => {
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(toast.success).toHaveBeenCalledWith('auth.logout.success', { id: 'logout-success' });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows error toast when token is expired', async () => {
    authState.user = { expired: true };

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(toast.error).toHaveBeenCalledWith('auth.errors.TokenExpired');
  });

  it('calls removeCookie with correct path and domain', async () => {
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(mockRemoveCookie).toHaveBeenCalledWith(
      'authToken',
      expect.objectContaining({
        path: '/',
        domain: window.location.hostname,
      }),
    );
  });

  it('replaces history state for force logout', async () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const { result } = renderHook(() => useLogout({ isForceLogout: true }));

    await act(async () => {
      await result.current();
    });

    expect(replaceStateSpy).toHaveBeenCalledWith({}, '', '/login');
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(PopStateEvent));

    replaceStateSpy.mockRestore();
    dispatchSpy.mockRestore();
  });

  it('does not replace history state for normal logout', async () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(replaceStateSpy).not.toHaveBeenCalled();

    replaceStateSpy.mockRestore();
  });
});
