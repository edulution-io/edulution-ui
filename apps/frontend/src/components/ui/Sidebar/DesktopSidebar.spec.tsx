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

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/files' }),
}));
vi.mock('usehooks-ts', () => ({
  useWindowSize: () => ({ width: 1024, height: 768 }),
}));
vi.mock('@libs/ui/constants', () => ({
  SIDEBAR_TRANSLATE_AMOUNT: 56,
}));
vi.mock('@libs/ui/constants/sidebar', () => ({
  SIDEBAR_ARROW_BUTTON_HEIGHT: 40,
}));
vi.mock('./SidebarMenuItems', () => ({
  HomeButton: () => <div data-testid="home-button">Home</div>,
  NotificationBellButton: () => <div data-testid="notification-bell">Bell</div>,
  SidebarItem: ({ menuItem }: any) => <div data-testid={`sidebar-item-${menuItem.link}`}>{menuItem.title}</div>,
  UserMenuButton: () => <div data-testid="user-menu">User</div>,
}));
vi.mock('./SidebarMenuItems/SidebarArrowButton', () => ({
  default: ({ direction, onClick }: any) => (
    <button
      type="button"
      data-testid={`arrow-${direction}`}
      onClick={onClick}
    >
      {direction}
    </button>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import DesktopSidebar from './DesktopSidebar';

const sidebarItems = [
  { title: 'Files', link: '/files', icon: '/icons/files.svg', color: 'bg-blue-500' },
  { title: 'Settings', link: '/settings', icon: '/icons/settings.svg', color: 'bg-green-500' },
];

describe('DesktopSidebar', () => {
  it('renders the HomeButton', () => {
    render(<DesktopSidebar sidebarItems={sidebarItems} />);

    expect(screen.getByTestId('home-button')).toBeInTheDocument();
  });

  it('renders SidebarItem for each sidebar item', () => {
    render(<DesktopSidebar sidebarItems={sidebarItems} />);

    expect(screen.getByTestId('sidebar-item-/files')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-item-/settings')).toBeInTheDocument();
  });

  it('renders NotificationBellButton and UserMenuButton', () => {
    render(<DesktopSidebar sidebarItems={sidebarItems} />);

    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('renders all sidebar items with correct titles', () => {
    render(<DesktopSidebar sidebarItems={sidebarItems} />);

    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders without arrow buttons initially when content fits', () => {
    render(<DesktopSidebar sidebarItems={sidebarItems} />);

    expect(screen.queryByTestId('arrow-up')).not.toBeInTheDocument();
  });
});
