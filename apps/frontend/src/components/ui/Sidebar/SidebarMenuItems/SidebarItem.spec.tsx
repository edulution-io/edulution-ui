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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));
vi.mock('react-router-dom', () => ({
  NavLink: ({ children, to, className, ...props }: any) => (
    <a
      href={to}
      className={typeof className === 'function' ? className({ isActive: false }) : className}
      {...props}
    >
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: '/files' }),
}));
vi.mock('@libs/ui/constants', () => ({
  SIDEBAR_WIDTH: 64,
}));
vi.mock('@libs/common/utils', () => ({
  getRootPathName: (path: string) => `/${path.split('/')[1]}`,
}));
vi.mock('@/components/ui/Sidebar/SidebarMenuItems/NotificationCounter', () => ({
  default: ({ count }: any) => (count > 0 ? <span data-testid="notification-counter">{count}</span> : null),
}));
vi.mock('@/components/PageTitle', () => ({
  default: ({ translationId }: any) => <title data-testid="page-title">{translationId}</title>,
}));
vi.mock('@/hooks/useTrulyVisible', () => ({
  default: () => false,
}));
vi.mock('@/components/shared/DynamicEllipsis', () => ({
  default: ({ text }: any) => <span data-testid="dynamic-ellipsis">{text}</span>,
}));
vi.mock('@/components/ui/Sidebar/SidebarMenuItems/SidebarItemPopover', () => ({
  default: () => <div data-testid="sidebar-popover" />,
}));
vi.mock('@/components/ui/Sidebar/SidebarMenuItems/SidebarItemIcon', () => ({
  default: ({ title }: any) => <span data-testid="sidebar-item-icon">{title}</span>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import SidebarItem from './SidebarItem';

const defaultMenuItem = {
  title: 'Files',
  icon: '/icons/files.svg',
  color: 'bg-blue-500',
  link: '/files',
  notificationCounter: 0,
};

describe('SidebarItem', () => {
  it('renders the sidebar item with title', () => {
    render(<SidebarItem menuItem={defaultMenuItem} />);

    const allFiles = screen.getAllByText('Files');
    expect(allFiles.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the icon via SidebarItemIcon', () => {
    render(<SidebarItem menuItem={defaultMenuItem} />);

    expect(screen.getByTestId('sidebar-item-icon')).toBeInTheDocument();
  });

  it('renders PageTitle when item link matches current pathname', () => {
    render(<SidebarItem menuItem={defaultMenuItem} />);

    expect(screen.getByTestId('page-title')).toBeInTheDocument();
  });

  it('renders notification counter when count is greater than 0', () => {
    const menuItem = { ...defaultMenuItem, notificationCounter: 5 };
    render(<SidebarItem menuItem={menuItem} />);

    expect(screen.getByTestId('notification-counter')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders DynamicEllipsis with the title', () => {
    render(<SidebarItem menuItem={defaultMenuItem} />);

    expect(screen.getByTestId('dynamic-ellipsis')).toHaveTextContent('Files');
  });
});
