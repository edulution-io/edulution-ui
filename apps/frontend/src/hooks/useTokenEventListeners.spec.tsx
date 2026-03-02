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

const { mockHandleLogout, mockSigninSilent, authState, eventHandlers } = vi.hoisted(() => ({
  mockHandleLogout: vi.fn(),
  mockSigninSilent: vi.fn(),
  authState: {
    user: { expired: false, expires_at: Math.floor(Date.now() / 1000) + 3600 } as {
      expired: boolean;
      expires_at?: number;
    } | null,
  },
  eventHandlers: {
    userLoaded: [] as (() => void)[],
    silentRenewError: [] as (() => void)[],
    accessTokenExpiring: [] as (() => void)[],
    accessTokenExpired: [] as (() => void)[],
  },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), dismiss: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    user: authState.user,
    signinSilent: mockSigninSilent,
    events: {
      addUserLoaded: (handler: () => void) => {
        eventHandlers.userLoaded.push(handler);
        return () => {
          eventHandlers.userLoaded = eventHandlers.userLoaded.filter((h) => h !== handler);
        };
      },
      addSilentRenewError: (handler: () => void) => {
        eventHandlers.silentRenewError.push(handler);
        return () => {
          eventHandlers.silentRenewError = eventHandlers.silentRenewError.filter((h) => h !== handler);
        };
      },
      addAccessTokenExpiring: (handler: () => void) => {
        eventHandlers.accessTokenExpiring.push(handler);
        return () => {
          eventHandlers.accessTokenExpiring = eventHandlers.accessTokenExpiring.filter((h) => h !== handler);
        };
      },
      addAccessTokenExpired: (handler: () => void) => {
        eventHandlers.accessTokenExpired.push(handler);
        return () => {
          eventHandlers.accessTokenExpired = eventHandlers.accessTokenExpired.filter((h) => h !== handler);
        };
      },
    },
  }),
}));

vi.mock('./useLogout', () => ({
  default: () => mockHandleLogout,
}));

vi.mock('@libs/common/utils/delay', () => ({
  default: () => Promise.resolve(),
}));

import { renderHook } from '@testing-library/react';
import { toast } from 'sonner';
import useTokenEventListeners from './useTokenEventListeners';

describe('useTokenEventListeners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { expired: false, expires_at: Math.floor(Date.now() / 1000) + 3600 };
    eventHandlers.userLoaded = [];
    eventHandlers.silentRenewError = [];
    eventHandlers.accessTokenExpiring = [];
    eventHandlers.accessTokenExpired = [];
  });

  it('registers event listeners on mount', () => {
    renderHook(() => useTokenEventListeners());

    expect(eventHandlers.userLoaded).toHaveLength(1);
    expect(eventHandlers.silentRenewError).toHaveLength(1);
    expect(eventHandlers.accessTokenExpiring).toHaveLength(1);
    expect(eventHandlers.accessTokenExpired).toHaveLength(1);
  });

  it('removes event listeners on unmount', () => {
    const { unmount } = renderHook(() => useTokenEventListeners());

    expect(eventHandlers.userLoaded).toHaveLength(1);
    expect(eventHandlers.accessTokenExpired).toHaveLength(1);

    unmount();

    expect(eventHandlers.userLoaded).toHaveLength(0);
    expect(eventHandlers.silentRenewError).toHaveLength(0);
    expect(eventHandlers.accessTokenExpiring).toHaveLength(0);
    expect(eventHandlers.accessTokenExpired).toHaveLength(0);
  });

  it('calls handleLogout when user token is already expired', () => {
    authState.user = { expired: true };

    renderHook(() => useTokenEventListeners());

    expect(toast.error).toHaveBeenCalledWith('auth.errors.TokenExpired');
    expect(mockHandleLogout).toHaveBeenCalled();
  });

  it('does not call handleLogout when token is not expired', () => {
    authState.user = { expired: false, expires_at: Math.floor(Date.now() / 1000) + 3600 };

    renderHook(() => useTokenEventListeners());

    expect(mockHandleLogout).not.toHaveBeenCalled();
  });

  it('adds visibilitychange event listener', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    renderHook(() => useTokenEventListeners());

    expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));

    addEventListenerSpy.mockRestore();
  });

  it('removes visibilitychange event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useTokenEventListeners());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('handles token expired event by logging out once', () => {
    renderHook(() => useTokenEventListeners());

    const handler = eventHandlers.accessTokenExpired[0];
    handler();

    expect(toast.error).toHaveBeenCalledWith('auth.errors.TokenExpired');
    expect(mockHandleLogout).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();
    handler();

    expect(mockHandleLogout).not.toHaveBeenCalled();
  });
});
