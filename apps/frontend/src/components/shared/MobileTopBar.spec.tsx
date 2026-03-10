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
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));
vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faBars: { iconName: 'bars', prefix: 'fas' },
  faBell: { iconName: 'bell', prefix: 'fas' },
  faClose: { iconName: 'close', prefix: 'fas' },
  faRotateRight: { iconName: 'rotate-right', prefix: 'fas' },
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
vi.mock('@libs/ui/constants/sidebar', () => ({
  MOBILE_TOP_BAR_HEIGHT_PX: 40,
  SIDEBAR_ICON_WIDTH: '40px',
}));
vi.mock('@libs/notification/constants/notificationCounterVariant', () => ({
  default: { APP_NOTIFICATION: 'bg-accent', NOTIFICATION_PANEL: 'bg-primary' },
}));

const mockToggleMobileSidebar = vi.fn();
const mockToggleMobileMenuBar = vi.fn();
const mockSetIsSheetOpen = vi.fn();

vi.mock('@/components/ui/Sidebar/useSidebarStore', () => ({
  default: vi.fn(() => ({
    toggleMobileSidebar: mockToggleMobileSidebar,
    isMobileSidebarOpen: false,
  })),
}));
vi.mock('@/components/shared/useMenuBarStore', () => ({
  default: vi.fn(() => ({
    toggleMobileMenuBar: mockToggleMobileMenuBar,
    isMobileMenuBarOpen: false,
  })),
}));
vi.mock('@/store/EduApiStore/usePlatformStore', () => ({
  default: vi.fn(() => ({ isEdulutionApp: false })),
}));
vi.mock('@/store/useNotificationStore', () => ({
  default: vi.fn(() => ({
    unreadCount: 0,
    setIsSheetOpen: mockSetIsSheetOpen,
  })),
}));
vi.mock('@/components/ui/Sidebar/SidebarMenuItems/NotificationCounter', () => ({
  default: ({ count }: any) => (count > 0 ? <span data-testid="notification-counter">{count}</span> : null),
}));
vi.mock('@/assets/icons', () => ({
  MobileLogoIcon: (props: any) => (
    <span
      data-testid="mobile-logo-icon"
      {...props}
    />
  ),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import useSidebarStore from '@/components/ui/Sidebar/useSidebarStore';
import useMenuBarStore from '@/components/shared/useMenuBarStore';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import useNotificationStore from '@/store/useNotificationStore';
import MobileTopBar from './MobileTopBar';

describe('MobileTopBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSidebarStore).mockReturnValue({
      toggleMobileSidebar: mockToggleMobileSidebar,
      isMobileSidebarOpen: false,
    } as any);
    vi.mocked(useMenuBarStore).mockReturnValue({
      toggleMobileMenuBar: mockToggleMobileMenuBar,
      isMobileMenuBarOpen: false,
    } as any);
    vi.mocked(usePlatformStore).mockReturnValue({ isEdulutionApp: false } as any);
    vi.mocked(useNotificationStore).mockReturnValue({
      unreadCount: 0,
      setIsSheetOpen: mockSetIsSheetOpen,
    } as any);
  });

  it('returns null when both showLeftButton and showRightButton are false', () => {
    const { container } = render(
      <MobileTopBar
        showLeftButton={false}
        showRightButton={false}
        refreshPage={vi.fn()}
      />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders left menu button when showLeftButton is true', () => {
    render(
      <MobileTopBar
        showLeftButton
        showRightButton={false}
        refreshPage={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('calls toggleMobileMenuBar when left button is clicked', () => {
    render(
      <MobileTopBar
        showLeftButton
        refreshPage={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(mockToggleMobileMenuBar).toHaveBeenCalledTimes(1);
  });

  it('renders notification bell and calls setIsSheetOpen on click', () => {
    render(
      <MobileTopBar
        showLeftButton
        refreshPage={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    const bellButton = buttons[1];
    fireEvent.click(bellButton);
    expect(mockSetIsSheetOpen).toHaveBeenCalledWith(true);
  });

  it('renders close button when left menu is open', () => {
    vi.mocked(useMenuBarStore).mockReturnValue({
      toggleMobileMenuBar: mockToggleMobileMenuBar,
      isMobileMenuBarOpen: true,
    } as any);
    render(
      <MobileTopBar
        showLeftButton
        refreshPage={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);
    expect(mockToggleMobileMenuBar).toHaveBeenCalled();
  });

  it('renders refresh button when isEdulutionApp is true', () => {
    vi.mocked(usePlatformStore).mockReturnValue({ isEdulutionApp: true } as any);
    const refreshPage = vi.fn();
    render(
      <MobileTopBar
        showLeftButton
        refreshPage={refreshPage}
      />,
    );
    const buttons = screen.getAllByRole('button');
    const refreshButton = buttons[1];
    fireEvent.click(refreshButton);
    expect(refreshPage).toHaveBeenCalled();
  });
});
