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
  faBell: { iconName: 'bell', prefix: 'fas' },
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
vi.mock('@libs/notification/constants/notificationCounterVariant', () => ({
  default: { APP_NOTIFICATION: 'bg-accent', NOTIFICATION_PANEL: 'bg-primary' },
}));

const mockSetIsSheetOpen = vi.fn();
const mockToggleMobileSidebar = vi.fn();

vi.mock('@/store/useNotificationStore', () => ({
  default: vi.fn(() => ({
    unreadCount: 0,
    isSheetOpen: false,
    setIsSheetOpen: mockSetIsSheetOpen,
  })),
}));
vi.mock('@/store/EduApiStore/usePlatformStore', () => ({
  default: (selector: any) => selector({ isEdulutionApp: false }),
}));
vi.mock('@/components/ui/Sidebar/useSidebarStore', () => ({
  default: vi.fn(() => ({
    isMobileSidebarOpen: false,
    toggleMobileSidebar: mockToggleMobileSidebar,
  })),
}));
vi.mock('@/components/ui/Sidebar/SidebarMenuItems/NotificationCounter', () => ({
  default: ({ count }: any) => (count > 0 ? <span data-testid="notification-counter">{count}</span> : null),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import useNotificationStore from '@/store/useNotificationStore';
import useSidebarStore from '@/components/ui/Sidebar/useSidebarStore';
import NotificationBellButton from './NotificationBellButton';

describe('NotificationBellButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotificationStore).mockReturnValue({
      unreadCount: 0,
      isSheetOpen: false,
      setIsSheetOpen: mockSetIsSheetOpen,
    } as any);
    vi.mocked(useSidebarStore).mockReturnValue({
      isMobileSidebarOpen: false,
      toggleMobileSidebar: mockToggleMobileSidebar,
    } as any);
  });

  it('renders the notification bell with label', () => {
    render(<NotificationBellButton />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'notificationscenter.sidebar');
    expect(screen.getByText('notificationscenter.sidebar')).toBeInTheDocument();
  });

  it('opens sheet on click when sheet is closed', () => {
    render(<NotificationBellButton />);
    const button = screen.getByRole('button');
    fireEvent.pointerDown(button);
    fireEvent.click(button);
    expect(mockSetIsSheetOpen).toHaveBeenCalledWith(true);
  });

  it('closes sheet on click when sheet is already open', () => {
    vi.mocked(useNotificationStore).mockReturnValue({
      unreadCount: 0,
      isSheetOpen: true,
      setIsSheetOpen: mockSetIsSheetOpen,
    } as any);
    render(<NotificationBellButton />);
    const button = screen.getByRole('button');
    fireEvent.pointerDown(button);
    fireEvent.click(button);
    expect(mockSetIsSheetOpen).toHaveBeenCalledWith(false);
  });

  it('toggles mobile sidebar closed before opening sheet', () => {
    vi.mocked(useSidebarStore).mockReturnValue({
      isMobileSidebarOpen: true,
      toggleMobileSidebar: mockToggleMobileSidebar,
    } as any);
    render(<NotificationBellButton />);
    const button = screen.getByRole('button');
    fireEvent.pointerDown(button);
    fireEvent.click(button);
    expect(mockToggleMobileSidebar).toHaveBeenCalled();
  });

  it('renders notification counter when unread count is greater than 0', () => {
    vi.mocked(useNotificationStore).mockReturnValue({
      unreadCount: 5,
      isSheetOpen: false,
      setIsSheetOpen: mockSetIsSheetOpen,
    } as any);
    render(<NotificationBellButton />);
    expect(screen.getByTestId('notification-counter')).toHaveTextContent('5');
  });
});
