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
vi.mock('@/assets/icons', () => ({
  QrCodeIcon: () => null,
  SurveysViewOwnIcon: () => null,
}));
vi.mock('@/hooks/useMedia', () => ({
  default: vi.fn(() => ({ isMobileView: false, isTabletView: false })),
}));
vi.mock('@/hooks/useMenuBarConfig', () => ({
  default: vi.fn(),
}));
vi.mock('@/hooks/useLanguage', () => ({
  default: () => ({ language: 'en' }),
}));
vi.mock('@/hooks/useOrganizationType', () => ({
  default: () => ({ isSchoolEnvironment: true }),
}));
vi.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: () => null,
}));

import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderWithProviders from '@libs/test-utils/providers/renderWithProviders';
import APPS from '@libs/appconfig/constants/apps';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import useMedia from '@/hooks/useMedia';
import useMenuBarStore from './useMenuBarStore';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import MenuBar from './MenuBar';

const mockMenuBarConfig = (overrides = {}) => ({
  menuItems: [
    {
      id: 'item-1',
      label: 'Dashboard',
      icon: '',
      action: vi.fn(),
    },
    {
      id: 'item-2',
      label: 'Users',
      icon: '',
      action: vi.fn(),
    },
  ],
  title: 'Test App',
  icon: '',
  color: 'bg-ciBlue',
  disabled: false,
  appName: APPS.FILE_SHARING,
  ...overrides,
});

describe('MenuBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMenuBarStore.setState({
      isMobileMenuBarOpen: false,
    });
    usePlatformStore.setState({ isEdulutionApp: false });
    vi.mocked(useMedia).mockReturnValue({ isMobileView: false, isTabletView: false });
    vi.mocked(useMenuBarConfig).mockReturnValue(mockMenuBarConfig());
  });

  it('renders menu items from config', () => {
    renderWithProviders(<MenuBar />, { route: '/filesharing/item-1' });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('applies expanded width on desktop', () => {
    const { container } = renderWithProviders(<MenuBar />, { route: '/filesharing/item-1' });

    const expandedDiv = container.querySelector('.w-64');
    expect(expandedDiv).toBeInTheDocument();
  });

  it('shows labels on desktop', () => {
    renderWithProviders(<MenuBar />, { route: '/filesharing/item-1' });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('applies active color class to selected menu item', () => {
    renderWithProviders(<MenuBar />, { route: '/filesharing/item-1' });

    const buttons = screen.getAllByRole('button');
    const activeButton = buttons.find((b) => within(b).queryByText('Dashboard'));
    expect(activeButton?.className).toContain('bg-ciBlue');
  });

  it('renders mobile overlay when isMobileView is true', () => {
    vi.mocked(useMedia).mockReturnValue({ isMobileView: true, isTabletView: false });
    useMenuBarStore.setState({ isMobileMenuBarOpen: true });

    const { container } = renderWithProviders(<MenuBar />, { route: '/filesharing/item-1' });

    const mobileOverlay = container.querySelector('.translate-x-0');
    expect(mobileOverlay).toBeInTheDocument();
  });

  it('hides mobile menu when isMobileMenuBarOpen is false', () => {
    vi.mocked(useMedia).mockReturnValue({ isMobileView: true, isTabletView: false });
    useMenuBarStore.setState({ isMobileMenuBarOpen: false });

    const { container } = renderWithProviders(<MenuBar />, { route: '/filesharing/item-1' });

    const hiddenOverlay = container.querySelector('.-translate-x-full');
    expect(hiddenOverlay).toBeInTheDocument();
  });

  it('returns null when menuBarEntries.disabled is true', () => {
    vi.mocked(useMenuBarConfig).mockReturnValue(mockMenuBarConfig({ disabled: true }));

    const { container } = renderWithProviders(<MenuBar />, { route: '/filesharing/item-1' });

    expect(container.innerHTML).toBe('');
  });

  it('calls item action when menu item is clicked', async () => {
    const user = userEvent.setup();
    const actionFn = vi.fn();
    vi.mocked(useMenuBarConfig).mockReturnValue(
      mockMenuBarConfig({
        menuItems: [{ id: 'item-1', label: 'Dashboard', icon: '', action: actionFn }],
      }),
    );

    renderWithProviders(<MenuBar />, { route: '/filesharing/item-1' });

    await user.click(screen.getByText('Dashboard'));
    expect(actionFn).toHaveBeenCalled();
  });

  it('renders mobile overlay when isEdulutionApp is true', () => {
    usePlatformStore.setState({ isEdulutionApp: true });
    useMenuBarStore.setState({ isMobileMenuBarOpen: true });

    const { container } = renderWithProviders(<MenuBar />, { route: '/filesharing/item-1' });

    const mobileOverlay = container.querySelector('.translate-x-0');
    expect(mobileOverlay).toBeInTheDocument();
  });

  it('uses mobile layout instead of desktop when isEdulutionApp is true', () => {
    usePlatformStore.setState({ isEdulutionApp: true });

    const { container } = renderWithProviders(<MenuBar />, { route: '/filesharing/item-1' });

    const aside = container.querySelector('aside');
    expect(aside).not.toBeInTheDocument();
  });

  it('closes mobile menu on click outside when isEdulutionApp is true', async () => {
    const user = userEvent.setup();
    usePlatformStore.setState({ isEdulutionApp: true });
    useMenuBarStore.setState({ isMobileMenuBarOpen: true });

    renderWithProviders(<MenuBar />, { route: '/filesharing/item-1' });

    await user.click(document.body);

    expect(useMenuBarStore.getState().isMobileMenuBarOpen).toBe(false);
  });
});
