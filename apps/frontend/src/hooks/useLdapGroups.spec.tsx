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

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-use-before-define, jsx-a11y/label-has-associated-control, jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus, jsx-a11y/role-has-required-aria-props, react/button-has-type, react/display-name, react/no-array-index-key, no-underscore-dangle, no-plusplus */

import { renderHook } from '@testing-library/react';
import useUserStore from '@/store/UserStore/useUserStore';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import useLdapGroups from './useLdapGroups';

const createToken = (payload: Record<string, unknown>) => {
  const header = btoa(JSON.stringify({ alg: 'HS256' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

describe('useLdapGroups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({
      isAuthenticated: false,
      eduApiToken: '',
      user: null as never,
    });
    useGlobalSettingsApiStore.setState({ globalSettings: null });
  });

  it('returns not ready when not authenticated', () => {
    useUserStore.setState({ isAuthenticated: false, eduApiToken: '' });

    const { result } = renderHook(() => useLdapGroups());

    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.ldapGroups).toEqual([]);
    expect(result.current.isAuthReady).toBe(false);
  });

  it('returns not ready when no token', () => {
    useUserStore.setState({ isAuthenticated: true, eduApiToken: '' });

    const { result } = renderHook(() => useLdapGroups());

    expect(result.current.isAuthReady).toBe(false);
    expect(result.current.ldapGroups).toEqual([]);
  });

  it('returns not ready when no globalSettings', () => {
    useUserStore.setState({
      isAuthenticated: true,
      eduApiToken: createToken({ ldapGroups: ['/teachers'] }),
    });
    useGlobalSettingsApiStore.setState({ globalSettings: null });

    const { result } = renderHook(() => useLdapGroups());

    expect(result.current.isAuthReady).toBe(false);
  });

  it('returns isSuperAdmin true when user is admin', () => {
    useUserStore.setState({
      isAuthenticated: true,
      eduApiToken: createToken({ ldapGroups: ['/admins', '/teachers'] }),
    });
    useGlobalSettingsApiStore.setState({
      globalSettings: { auth: { adminGroups: [{ path: '/admins' }] } } as never,
    });

    const { result } = renderHook(() => useLdapGroups());

    expect(result.current.isSuperAdmin).toBe(true);
    expect(result.current.isAuthReady).toBe(true);
  });

  it('returns isSuperAdmin false when user is not admin', () => {
    useUserStore.setState({
      isAuthenticated: true,
      eduApiToken: createToken({ ldapGroups: ['/teachers', '/staff'] }),
    });
    useGlobalSettingsApiStore.setState({
      globalSettings: { auth: { adminGroups: [{ path: '/admins' }] } } as never,
    });

    const { result } = renderHook(() => useLdapGroups());

    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.isAuthReady).toBe(true);
  });

  it('returns ldapGroups from token payload', () => {
    useUserStore.setState({
      isAuthenticated: true,
      eduApiToken: createToken({ ldapGroups: ['/teachers', '/staff', '/science'] }),
    });
    useGlobalSettingsApiStore.setState({
      globalSettings: { auth: { adminGroups: [] } } as never,
    });

    const { result } = renderHook(() => useLdapGroups());

    expect(result.current.ldapGroups).toEqual(['/teachers', '/staff', '/science']);
    expect(result.current.isAuthReady).toBe(true);
  });

  it('returns empty ldapGroups when token has no ldapGroups field', () => {
    useUserStore.setState({
      isAuthenticated: true,
      eduApiToken: createToken({}),
    });
    useGlobalSettingsApiStore.setState({
      globalSettings: { auth: { adminGroups: [] } } as never,
    });

    const { result } = renderHook(() => useLdapGroups());

    expect(result.current.ldapGroups).toEqual([]);
    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.isAuthReady).toBe(true);
  });
});
