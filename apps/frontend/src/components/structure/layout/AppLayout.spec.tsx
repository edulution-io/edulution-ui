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

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/hooks/useMedia', () => ({
  default: vi.fn(() => ({ isMobileView: false, isTabletView: false })),
}));
vi.mock('@/hooks/useMenuBarConfig', () => ({
  default: vi.fn(),
}));
vi.mock('@/components/shared/MenuBar', () => ({
  default: () => <div data-testid="menu-bar">MenuBar</div>,
}));
vi.mock('@/components/shared/MobileTopBar', () => ({
  default: () => <div data-testid="mobile-top-bar" />,
}));
vi.mock('@/components', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock('@/components/structure/layout/Overlays', () => ({
  default: () => <div data-testid="overlays" />,
}));
vi.mock('@/components/shared/OfflineBanner', () => ({
  default: () => <div data-testid="offline-banner">common.offline</div>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import type { ReactNode } from 'react';
import APPS from '@libs/appconfig/constants/apps';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import useUserStore from '@/store/UserStore/useUserStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useEduApiStore from '@/store/EduApiStore/useEduApiStore';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import AppLayout from './AppLayout';

const testI18n = i18n.createInstance();
testI18n.init({ lng: 'cimode', resources: {}, interpolation: { escapeValue: false } });

const renderAppLayout = (route = '/dashboard', childContent = 'Child Content') => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>
      <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
    </MemoryRouter>
  );

  return render(
    <Wrapper>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="*"
            element={<div data-testid="child-content">{childContent}</div>}
          />
        </Route>
      </Routes>
    </Wrapper>,
  );
};

const nonDisabledMenuBarConfig = {
  menuItems: [{ id: 'item-1', label: 'Test', icon: '', action: vi.fn() }],
  title: 'Test',
  icon: '',
  color: 'bg-ciBlue',
  disabled: false,
  appName: APPS.FILE_SHARING,
};

const disabledMenuBarConfig = {
  menuItems: [],
  title: '',
  icon: '',
  color: '',
  disabled: true,
  appName: APPS.NONE,
};

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePlatformStore.setState({ isEdulutionApp: false });
    useEduApiStore.setState({ isEduApiHealthy: true });
    useUserStore.setState({ isAuthenticated: true });
    useAppConfigsStore.setState({
      appConfigs: [{ name: APPS.FILE_SHARING }] as never,
    });
    vi.mocked(useMenuBarConfig).mockReturnValue(nonDisabledMenuBarConfig);
  });

  it('renders Outlet child content', () => {
    renderAppLayout('/dashboard', 'Dashboard Page');

    expect(screen.getByTestId('child-content')).toHaveTextContent('Dashboard Page');
  });

  it('renders MenuBar when not disabled', () => {
    vi.mocked(useMenuBarConfig).mockReturnValue(nonDisabledMenuBarConfig);

    renderAppLayout('/filesharing/item-1');

    expect(screen.getByTestId('menu-bar')).toBeInTheDocument();
  });

  it('does not render MenuBar when disabled', () => {
    vi.mocked(useMenuBarConfig).mockReturnValue(disabledMenuBarConfig);

    renderAppLayout('/dashboard');

    expect(screen.queryByTestId('menu-bar')).not.toBeInTheDocument();
  });

  it('renders OfflineBanner when isEduApiHealthy is false', () => {
    useEduApiStore.setState({ isEduApiHealthy: false });

    renderAppLayout('/dashboard');

    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
  });

  it('does not render OfflineBanner when isEduApiHealthy is true', () => {
    useEduApiStore.setState({ isEduApiHealthy: true });

    renderAppLayout('/dashboard');

    expect(screen.queryByTestId('offline-banner')).not.toBeInTheDocument();
  });

  it('renders Sidebar when authenticated and appConfigs ready', () => {
    useUserStore.setState({ isAuthenticated: true });
    useAppConfigsStore.setState({
      appConfigs: [{ name: APPS.FILE_SHARING }] as never,
    });

    renderAppLayout('/dashboard');

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('hides Sidebar when not authenticated', () => {
    useUserStore.setState({ isAuthenticated: false });

    renderAppLayout('/login');

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('hides Sidebar when appConfigs contains APPS.NONE', () => {
    useAppConfigsStore.setState({
      appConfigs: [{ name: APPS.NONE }] as never,
    });

    renderAppLayout('/dashboard');

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });
});
