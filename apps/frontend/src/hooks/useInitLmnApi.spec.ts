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

const { mockSetLmnApiToken, mockGetOwnUser, mockGetLmnVersion } = vi.hoisted(() => ({
  mockSetLmnApiToken: vi.fn(),
  mockGetOwnUser: vi.fn(),
  mockGetLmnVersion: vi.fn(),
}));

vi.mock('./useDeploymentTarget', () => ({
  default: vi.fn(() => ({ isLmn: false, isGeneric: true })),
}));

vi.mock('./useLdapGroups', () => ({
  default: vi.fn(() => ({ isSuperAdmin: false })),
}));

vi.mock('@/store/useLmnApiStore', () => {
  const storeState = {
    lmnApiToken: null as string | null,
    setLmnApiToken: mockSetLmnApiToken,
    getOwnUser: mockGetOwnUser,
    getLmnVersion: mockGetLmnVersion,
  };
  const hook = () => storeState;
  hook.getState = () => storeState;
  hook.setState = (partial: Partial<typeof storeState>) => Object.assign(storeState, partial);
  return { default: hook };
});

vi.mock('@/store/UserStore/useUserStore', () => {
  let isAuthenticated = false;
  const hook = (selector: (s: { isAuthenticated: boolean }) => boolean) => selector({ isAuthenticated });
  hook.getState = () => ({ isAuthenticated });
  hook.setState = (partial: { isAuthenticated: boolean }) => {
    isAuthenticated = partial.isAuthenticated;
  };
  return { default: hook };
});

import { renderHook } from '@testing-library/react';
import useDeploymentTarget from './useDeploymentTarget';
import useLdapGroups from './useLdapGroups';
import useLmnApiStore from '@/store/useLmnApiStore';
import useUserStore from '@/store/UserStore/useUserStore';
import useInitLmnApi from './useInitLmnApi';

describe('useInitLmnApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeploymentTarget).mockReturnValue({ isLmn: false, isGeneric: true });
    vi.mocked(useLdapGroups).mockReturnValue({ isSuperAdmin: false });
    useLmnApiStore.setState({ lmnApiToken: null });
    useUserStore.setState({ isAuthenticated: false });
  });

  it('does not call setLmnApiToken when deployment is not LMN', () => {
    vi.mocked(useDeploymentTarget).mockReturnValue({ isLmn: false, isGeneric: true });
    useUserStore.setState({ isAuthenticated: true });

    renderHook(() => useInitLmnApi());

    expect(mockSetLmnApiToken).not.toHaveBeenCalled();
  });

  it('does not call setLmnApiToken when user is not authenticated', () => {
    vi.mocked(useDeploymentTarget).mockReturnValue({ isLmn: true, isGeneric: false });
    useUserStore.setState({ isAuthenticated: false });

    renderHook(() => useInitLmnApi());

    expect(mockSetLmnApiToken).not.toHaveBeenCalled();
  });

  it('calls setLmnApiToken when LMN, authenticated, and no token', () => {
    vi.mocked(useDeploymentTarget).mockReturnValue({ isLmn: true, isGeneric: false });
    useUserStore.setState({ isAuthenticated: true });
    useLmnApiStore.setState({ lmnApiToken: null });

    renderHook(() => useInitLmnApi());

    expect(mockSetLmnApiToken).toHaveBeenCalled();
    expect(mockGetOwnUser).not.toHaveBeenCalled();
    expect(mockGetLmnVersion).not.toHaveBeenCalled();
  });

  it('calls getOwnUser and getLmnVersion when LMN, authenticated, token exists, and isSuperAdmin', () => {
    vi.mocked(useDeploymentTarget).mockReturnValue({ isLmn: true, isGeneric: false });
    vi.mocked(useLdapGroups).mockReturnValue({ isSuperAdmin: true });
    useUserStore.setState({ isAuthenticated: true });
    useLmnApiStore.setState({ lmnApiToken: 'some-token' });

    renderHook(() => useInitLmnApi());

    expect(mockSetLmnApiToken).not.toHaveBeenCalled();
    expect(mockGetOwnUser).toHaveBeenCalled();
    expect(mockGetLmnVersion).toHaveBeenCalledWith(true);
  });

  it('calls getOwnUser but not getLmnVersion when not superAdmin', () => {
    vi.mocked(useDeploymentTarget).mockReturnValue({ isLmn: true, isGeneric: false });
    vi.mocked(useLdapGroups).mockReturnValue({ isSuperAdmin: false });
    useUserStore.setState({ isAuthenticated: true });
    useLmnApiStore.setState({ lmnApiToken: 'some-token' });

    renderHook(() => useInitLmnApi());

    expect(mockGetOwnUser).toHaveBeenCalled();
    expect(mockGetLmnVersion).not.toHaveBeenCalled();
  });

  it('does nothing when both isLmn and isAuthenticated are false', () => {
    vi.mocked(useDeploymentTarget).mockReturnValue({ isLmn: false, isGeneric: true });
    useUserStore.setState({ isAuthenticated: false });

    renderHook(() => useInitLmnApi());

    expect(mockSetLmnApiToken).not.toHaveBeenCalled();
    expect(mockGetOwnUser).not.toHaveBeenCalled();
    expect(mockGetLmnVersion).not.toHaveBeenCalled();
  });
});
