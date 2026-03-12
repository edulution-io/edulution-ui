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

const { mockGetUserAccounts, locationState } = vi.hoisted(() => ({
  mockGetUserAccounts: vi.fn(),
  locationState: { pathname: '/dashboard', search: '', hash: '' },
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => locationState,
}));

vi.mock('sonner', () => ({
  toast: vi.fn(),
  toast: Object.assign(vi.fn(), {
    dismiss: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('@/store/UserStore/useUserStore', () => {
  const storeState = {
    userAccounts: [] as { appName: string; accountId: string; accountUser: string; accountPassword: string }[],
    getUserAccounts: mockGetUserAccounts,
  };
  const hook = () => storeState;
  hook.getState = () => storeState;
  hook.setState = (partial: Partial<typeof storeState>) => Object.assign(storeState, partial);
  return { default: hook };
});

vi.mock('@/pages/Settings/AppConfig/useAppConfigsStore', () => {
  const storeState = {
    appConfigs: [] as { name: string }[],
  };
  const hook = () => storeState;
  hook.getState = () => storeState;
  hook.setState = (partial: Partial<typeof storeState>) => Object.assign(storeState, partial);
  return { default: hook };
});

vi.mock('@/components/ui/UserAccountsToastContent', () => ({
  default: () => null,
}));

import { renderHook } from '@testing-library/react';
import { toast } from 'sonner';
import useUserStore from '@/store/UserStore/useUserStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useUserAccounts from './useUserAccounts';

describe('useUserAccounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    locationState.pathname = '/dashboard';
    useUserStore.setState({
      userAccounts: [],
      getUserAccounts: mockGetUserAccounts,
    });
    useAppConfigsStore.setState({ appConfigs: [] });
  });

  it('calls getUserAccounts on mount when userAccounts is empty', () => {
    renderHook(() => useUserAccounts('testapp'));

    expect(mockGetUserAccounts).toHaveBeenCalled();
  });

  it('does not call getUserAccounts when userAccounts already exist', () => {
    useUserStore.setState({
      userAccounts: [{ appName: 'testapp', accountId: '1', accountUser: 'u', accountPassword: 'p' }],
      getUserAccounts: mockGetUserAccounts,
    });

    renderHook(() => useUserAccounts('testapp'));

    expect(mockGetUserAccounts).not.toHaveBeenCalled();
  });

  it('dismisses toast on unmount', () => {
    useAppConfigsStore.setState({ appConfigs: [{ name: 'testapp' }] });

    const { unmount } = renderHook(() => useUserAccounts('testapp'));

    unmount();

    expect(toast.dismiss).toHaveBeenCalled();
  });

  it('dismisses toast when pathname changes', () => {
    useAppConfigsStore.setState({ appConfigs: [{ name: 'testapp' }] });

    const { rerender } = renderHook(() => useUserAccounts('testapp'));

    locationState.pathname = '/other';
    rerender();

    expect(toast.dismiss).toHaveBeenCalled();
  });

  it('does not show toast when appName is null', () => {
    renderHook(() => useUserAccounts(null));

    expect(toast).not.toHaveBeenCalled();
  });

  it('does not show toast when appName is root route', () => {
    renderHook(() => useUserAccounts('/'));

    expect(toast).not.toHaveBeenCalled();
  });

  it('does not show toast when no appConfig matches', () => {
    useAppConfigsStore.setState({ appConfigs: [{ name: 'other' }] });

    renderHook(() => useUserAccounts('testapp'));

    expect(toast).not.toHaveBeenCalled();
  });

  it('shows toast when app has matching user accounts', () => {
    useAppConfigsStore.setState({ appConfigs: [{ name: 'testapp' }] });
    useUserStore.setState({
      userAccounts: [{ appName: 'testapp', accountId: '1', accountUser: 'u', accountPassword: 'p' }],
      getUserAccounts: mockGetUserAccounts,
    });

    renderHook(() => useUserAccounts('testapp'));

    expect(toast).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        id: 'testapp-embedded-login-toast',
        duration: 30000,
        position: 'top-right',
      }),
    );
  });

  it('does not show toast when user accounts exist but for different app', () => {
    useAppConfigsStore.setState({ appConfigs: [{ name: 'testapp' }] });
    useUserStore.setState({
      userAccounts: [{ appName: 'other', accountId: '1', accountUser: 'u', accountPassword: 'p' }],
      getUserAccounts: mockGetUserAccounts,
    });

    renderHook(() => useUserAccounts('testapp'));

    expect(toast).not.toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ id: expect.any(String) }));
  });
});
