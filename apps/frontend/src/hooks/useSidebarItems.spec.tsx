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

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));
vi.mock('@/assets/icons', () => ({ SettingsIcon: 'settings-icon-mock' }));

import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { type ReactNode } from 'react';
import APPS from '@libs/appconfig/constants/apps';
import APP_DISPLAY_LOCATIONS from '@libs/appconfig/constants/appDisplayLocations';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import useNotificationStore from '@/store/useNotificationStore';
import useUserStore from '@/store/UserStore/useUserStore';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import useSidebarItems from './useSidebarItems';

const testI18n = i18n.createInstance();
testI18n.init({ lng: 'cimode', resources: {}, interpolation: { escapeValue: false } });

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
  </MemoryRouter>
);

const mockGlobalSettings = {
  general: { organizationType: 'school' },
  auth: { adminGroups: [{ path: '/admins' }] },
};

const createAppConfig = (overrides: Record<string, unknown> = {}) => ({
  name: APPS.MAIL,
  icon: 'mail-icon',
  appType: 'native',
  displayLocations: [APP_DISPLAY_LOCATIONS.SIDEBAR],
  options: {},
  accessGroups: [],
  extendedOptions: {},
  position: 1,
  ...overrides,
});

describe('useSidebarItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useGlobalSettingsApiStore.setState({ globalSettings: mockGlobalSettings as never });

    useUserStore.setState({
      isAuthenticated: true,
      eduApiToken: 'eyJhbGciOiJIUzI1NiJ9.eyJsZGFwR3JvdXBzIjpbXX0.placeholder',
      user: { language: 'en' } as never,
    });

    useAppConfigsStore.setState({ appConfigs: [] as never });
    useMailsStore.setState({ mails: [] as never });
    useConferenceStore.setState({ runningConferences: [] as never });
    useBulletinBoardStore.setState({ bulletinBoardNotifications: [] as never });
    useNotificationStore.setState({ unreadCount: 0 });
  });

  it('returns empty array when no appConfigs exist', () => {
    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    expect(result.current).toEqual([]);
  });

  it('returns sidebar items from appConfigs that have sidebar display location', () => {
    useAppConfigsStore.setState({
      appConfigs: [
        createAppConfig({ name: APPS.MAIL }),
        createAppConfig({
          name: APPS.CONFERENCES,
          icon: 'conf-icon',
          displayLocations: [APP_DISPLAY_LOCATIONS.SIDEBAR],
        }),
        createAppConfig({ name: 'hidden-app', displayLocations: [APP_DISPLAY_LOCATIONS.EDU_APP] }),
      ] as never,
    });

    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    expect(result.current).toHaveLength(2);
    expect(result.current[0].link).toBe(`/${APPS.MAIL}`);
    expect(result.current[1].link).toBe(`/${APPS.CONFERENCES}`);
  });

  it('includes notification counter for mail app based on mails count', () => {
    useAppConfigsStore.setState({
      appConfigs: [createAppConfig({ name: APPS.MAIL })] as never,
    });
    useMailsStore.setState({
      mails: [{ id: 'mail-1' }, { id: 'mail-2' }, { id: 'mail-3' }] as never,
    });

    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    expect(result.current[0].notificationCounter).toBe(3);
  });

  it('includes notification counter for conference app based on running conferences', () => {
    useAppConfigsStore.setState({
      appConfigs: [createAppConfig({ name: APPS.CONFERENCES })] as never,
    });
    useConferenceStore.setState({
      runningConferences: [{ meetingID: 'c1' }, { meetingID: 'c2' }] as never,
    });

    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    expect(result.current[0].notificationCounter).toBe(2);
  });

  it('includes notification counter for bulletin board app', () => {
    useAppConfigsStore.setState({
      appConfigs: [createAppConfig({ name: APPS.BULLETIN_BOARD })] as never,
    });
    useBulletinBoardStore.setState({
      bulletinBoardNotifications: [{ id: 'b1' }] as never,
    });

    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    expect(result.current[0].notificationCounter).toBe(1);
  });

  it('includes notification counter for notifications center when unreadCount > 0', () => {
    useAppConfigsStore.setState({
      appConfigs: [createAppConfig({ name: APPS.NOTIFICATIONS_CENTER })] as never,
    });
    useNotificationStore.setState({ unreadCount: 5 });

    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    expect(result.current[0].notificationCounter).toBe(5);
  });

  it('returns undefined notification counter for notifications center when unreadCount is 0', () => {
    useAppConfigsStore.setState({
      appConfigs: [createAppConfig({ name: APPS.NOTIFICATIONS_CENTER })] as never,
    });
    useNotificationStore.setState({ unreadCount: 0 });

    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    expect(result.current[0].notificationCounter).toBeUndefined();
  });

  it('does not include Settings link when user is not super admin', () => {
    useAppConfigsStore.setState({
      appConfigs: [createAppConfig()] as never,
    });

    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    const settingsItem = result.current.find((item) => item.link === '/settings');
    expect(settingsItem).toBeUndefined();
  });

  it('includes Settings link when user is super admin', () => {
    useGlobalSettingsApiStore.setState({
      globalSettings: {
        general: { organizationType: 'school' },
        auth: { adminGroups: [{ path: '/admins' }] },
      } as never,
    });

    useUserStore.setState({
      isAuthenticated: true,
      eduApiToken: `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ ldapGroups: ['/admins'] }))}.sig`,
      user: { language: 'en' } as never,
    });

    useAppConfigsStore.setState({ appConfigs: [] as never });

    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    const settingsItem = result.current.find((item) => item.link === '/settings');
    expect(settingsItem).toBeDefined();
    expect(settingsItem?.icon).toBe('settings-icon-mock');
  });

  it('sets color to bg-ciGreenToBlue for all items', () => {
    useAppConfigsStore.setState({
      appConfigs: [createAppConfig()] as never,
    });

    const { result } = renderHook(() => useSidebarItems(), { wrapper });

    result.current.forEach((item) => {
      expect(item.color).toBe('bg-ciGreenToBlue');
    });
  });
});
