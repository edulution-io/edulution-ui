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
  cn: (...args: any[]) =>
    args
      .flatMap((a: any) => {
        if (typeof a === 'string') return a;
        if (a && typeof a === 'object')
          return Object.entries(a)
            .filter(([, v]) => v)
            .map(([k]) => k);
        return [];
      })
      .filter(Boolean)
      .join(' '),
}));

const mockToggleMobileSidebar = vi.fn();
vi.mock('../useSidebarStore', () => ({
  default: vi.fn(() => ({
    toggleMobileSidebar: mockToggleMobileSidebar,
  })),
}));
vi.mock('react-router-dom', () => ({
  NavLink: ({ children, to, onClick, className, ...props }: any) => (
    <a
      href={to}
      onClick={onClick}
      className={typeof className === 'function' ? className({ isActive: false }) : className}
      {...props}
    >
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: '/files' }),
}));
vi.mock('@libs/ui/constants', () => ({
  SIDEBAR_ICON_WIDTH: '40px',
}));
vi.mock('@libs/common/utils', () => ({
  getRootPathName: (path: string) => `/${path.split('/')[1]}`,
}));
vi.mock('@libs/common/constants/rootRoute', () => ({
  default: '/',
}));
vi.mock('@/components/ui/Sidebar/SidebarMenuItems/NotificationCounter', () => ({
  default: ({ count }: any) => (count > 0 ? <span data-testid="notification-counter">{count}</span> : null),
}));
vi.mock('@/components/PageTitle', () => ({
  default: ({ translationId }: any) => <title data-testid="page-title">{translationId}</title>,
}));
vi.mock('@/store/EduApiStore/usePlatformStore', () => ({
  default: (selector: any) => selector({ isEdulutionApp: false }),
}));
vi.mock('@/components/shared/IconWrapper', () => ({
  default: ({ iconSrc, alt, ...props }: any) => (
    <img
      data-testid="icon-wrapper"
      src={iconSrc}
      alt={alt}
      {...props}
    />
  ),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileSidebarItem from './MobileSidebarItem';

const defaultMenuItem = {
  title: 'Files',
  icon: '/icons/files.svg',
  color: 'bg-blue-500',
  link: '/files',
  notificationCounter: 0,
};

describe('MobileSidebarItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders menu item title and icon', () => {
    render(<MobileSidebarItem menuItem={defaultMenuItem} />);
    const allFiles = screen.getAllByText('Files');
    expect(allFiles.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('icon-wrapper')).toBeInTheDocument();
  });

  it('renders PageTitle when item matches current pathname', () => {
    render(<MobileSidebarItem menuItem={defaultMenuItem} />);
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
  });

  it('calls toggleMobileSidebar when NavLink is clicked', () => {
    render(<MobileSidebarItem menuItem={defaultMenuItem} />);
    const link = screen.getByRole('link');
    fireEvent.click(link);
    expect(mockToggleMobileSidebar).toHaveBeenCalledTimes(1);
  });

  it('renders notification counter when count is greater than 0', () => {
    const menuItem = { ...defaultMenuItem, notificationCounter: 3 };
    render(<MobileSidebarItem menuItem={menuItem} />);
    expect(screen.getByTestId('notification-counter')).toHaveTextContent('3');
  });

  it('does not render notification counter when count is 0', () => {
    render(<MobileSidebarItem menuItem={defaultMenuItem} />);
    expect(screen.queryByTestId('notification-counter')).not.toBeInTheDocument();
  });
});
