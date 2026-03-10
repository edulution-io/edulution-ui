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

const { locationState, mockLdapGroups } = vi.hoisted(() => ({
  locationState: { pathname: '/dashboard', search: '', hash: '' },
  mockLdapGroups: { isSuperAdmin: false, ldapGroups: [], isAuthReady: true },
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => locationState,
  useNavigate: () => vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('./useLdapGroups', () => ({
  default: () => mockLdapGroups,
}));

const mockFileSharingAction = vi.fn();
vi.mock('@/pages/FileSharing/useFileSharingMenuConfig', () => ({
  default: () => ({
    menuItems: [{ id: 'files', label: 'filesharing.menu.files', icon: 'folder', action: mockFileSharingAction }],
    title: 'filesharing.title',
    icon: 'folder',
    color: '#2196f3',
    appName: 'filesharing',
  }),
}));

const mockSurveysAction = vi.fn();
vi.mock('@/pages/Surveys/useSurveysPageMenu', () => ({
  default: () => ({
    menuItems: [{ id: 'surveys-list', label: 'surveys.menu.list', icon: 'poll', action: mockSurveysAction }],
    title: 'surveys.title',
    icon: 'poll',
    color: '#4caf50',
    appName: 'surveys',
  }),
}));

vi.mock('@/pages/ClassManagement/useClassManagementMenu', () => ({
  default: () => ({
    menuItems: [],
    title: 'classmanagement.title',
    icon: 'users',
    color: '#ff9800',
    appName: 'classmanagement',
  }),
}));

vi.mock('@/pages/LinuxmusterPage/useLinuxmusterMenu', () => ({
  default: () => ({
    menuItems: [],
    title: 'linuxmuster.title',
    icon: 'server',
    color: '#9c27b0',
    appName: 'linuxmuster',
  }),
}));

vi.mock('@/pages/UserSettings/useUserSettingsMenu', () => ({
  default: () => ({
    menuItems: [],
    title: 'usersettings.title',
    icon: 'cog',
    color: '#607d8b',
    appName: 'usersettings',
  }),
}));

const mockSettingsAction = vi.fn();
vi.mock('@/pages/Settings/useAppConfigPageMenu', () => ({
  default: () => ({
    menuItems: [
      { id: 'appstore', label: 'settings.menu.appstore', icon: 'store', action: mockSettingsAction },
      { id: 'general', label: 'settings.menu.general', icon: 'cog', action: mockSettingsAction },
    ],
    title: 'settings.title',
    icon: 'cog',
    color: '#795548',
    appName: 'settings',
  }),
}));

vi.mock('@/store/useSubMenuStore', () => {
  const storeState = {
    sections: [] as { id: string; label: string; action?: () => void }[],
    parentId: null as string | null,
  };
  const hook = () => storeState;
  hook.getState = () => storeState;
  hook.setState = (partial: Partial<typeof storeState>) => Object.assign(storeState, partial);
  return { default: hook };
});

vi.mock('@/hooks/useScrollToSection', () => ({
  default: () => ({ scrollToSection: vi.fn() }),
}));

import { renderHook } from '@testing-library/react';
import APPS from '@libs/appconfig/constants/apps';
import useMenuBarConfig from './useMenuBarConfig';

describe('useMenuBarConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    locationState.pathname = '/dashboard';
    mockLdapGroups.isSuperAdmin = false;
  });

  it('returns disabled entry for unknown routes', () => {
    locationState.pathname = '/unknown-route';

    const { result } = renderHook(() => useMenuBarConfig());

    expect(result.current.disabled).toBe(true);
    expect(result.current.menuItems).toHaveLength(0);
    expect(result.current.appName).toBe(APPS.NONE);
  });

  it('returns filesharing config when on filesharing route', () => {
    locationState.pathname = '/filesharing/files';

    const { result } = renderHook(() => useMenuBarConfig());

    expect(result.current.title).toBe('filesharing.title');
    expect(result.current.appName).toBe('filesharing');
    expect(result.current.menuItems).toHaveLength(1);
    expect(result.current.menuItems[0].id).toBe('files');
  });

  it('returns surveys config when on surveys route', () => {
    locationState.pathname = '/surveys/list';

    const { result } = renderHook(() => useMenuBarConfig());

    expect(result.current.title).toBe('surveys.title');
    expect(result.current.appName).toBe('surveys');
    expect(result.current.menuItems).toHaveLength(1);
  });

  it('does not include settings entry when user is not super admin', () => {
    locationState.pathname = '/settings/appstore';

    const { result } = renderHook(() => useMenuBarConfig());

    expect(result.current.disabled).toBe(true);
    expect(result.current.menuItems).toHaveLength(0);
  });

  it('includes settings entry when user is super admin', () => {
    mockLdapGroups.isSuperAdmin = true;
    locationState.pathname = '/settings/appstore';

    const { result } = renderHook(() => useMenuBarConfig());

    expect(result.current.title).toBe('settings.title');
    expect(result.current.menuItems.length).toBeGreaterThan(0);
  });

  it('translates menu item labels', () => {
    locationState.pathname = '/filesharing/files';

    const { result } = renderHook(() => useMenuBarConfig());

    expect(result.current.menuItems[0].label).toBe('filesharing.menu.files');
  });

  it('returns disabled entry for dashboard route', () => {
    locationState.pathname = '/dashboard';

    const { result } = renderHook(() => useMenuBarConfig());

    expect(result.current.disabled).toBe(true);
  });

  it('wraps menu item action in callable function', () => {
    locationState.pathname = '/filesharing/files';

    const { result } = renderHook(() => useMenuBarConfig());

    result.current.menuItems[0].action();

    expect(mockFileSharingAction).toHaveBeenCalled();
  });

  it('returns user settings config on user route', () => {
    locationState.pathname = '/user/language';

    const { result } = renderHook(() => useMenuBarConfig());

    expect(result.current.title).toBe('usersettings.title');
    expect(result.current.appName).toBe('usersettings');
  });
});
