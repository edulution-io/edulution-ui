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
vi.mock('@/hooks/useMedia', () => ({
  default: vi.fn(() => ({ isMobileView: false, isTabletView: false })),
}));
vi.mock('@/hooks/useSidebarItems', () => ({
  default: vi.fn(() => []),
}));
vi.mock('./DesktopSidebar', () => ({
  default: ({ sidebarItems }: { sidebarItems: unknown[] }) => (
    <div data-testid="desktop-sidebar">
      {sidebarItems.map((item: { title: string; link: string }) => (
        <span key={item.link}>{item.title}</span>
      ))}
    </div>
  ),
}));
vi.mock('./MobileSidebar', () => ({
  default: ({ sidebarItems }: { sidebarItems: unknown[] }) => (
    <div data-testid="mobile-sidebar">
      {sidebarItems.map((item: { title: string; link: string }) => (
        <span key={item.link}>{item.title}</span>
      ))}
    </div>
  ),
}));
vi.mock('@/pages/NotificationsCenter/components/NotificationPanel', () => ({
  default: () => <div data-testid="notification-panel" />,
}));

import { screen } from '@testing-library/react';
import renderWithProviders from '@libs/test-utils/providers/renderWithProviders';
import useMedia from '@/hooks/useMedia';
import useSidebarItems from '@/hooks/useSidebarItems';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import type { SidebarMenuItem } from '@libs/ui/types/sidebar';
import Sidebar from './Sidebar';

const mockSidebarItems: SidebarMenuItem[] = [
  { title: 'File Sharing', link: '/filesharing', icon: 'file-icon', color: 'bg-ciGreenToBlue' },
  { title: 'Mail', link: '/mail', icon: 'mail-icon', color: 'bg-ciGreenToBlue' },
];

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePlatformStore.setState({ isEdulutionApp: false });
    vi.mocked(useMedia).mockReturnValue({ isMobileView: false, isTabletView: false });
    vi.mocked(useSidebarItems).mockReturnValue(mockSidebarItems);
  });

  it('renders DesktopSidebar on desktop view', () => {
    vi.mocked(useMedia).mockReturnValue({ isMobileView: false, isTabletView: false });

    renderWithProviders(<Sidebar />);

    expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-sidebar')).not.toBeInTheDocument();
  });

  it('renders MobileSidebar on mobile view', () => {
    vi.mocked(useMedia).mockReturnValue({ isMobileView: true, isTabletView: false });

    renderWithProviders(<Sidebar />);

    expect(screen.getByTestId('mobile-sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-sidebar')).not.toBeInTheDocument();
  });

  it('renders MobileSidebar on tablet view', () => {
    vi.mocked(useMedia).mockReturnValue({ isMobileView: false, isTabletView: true });

    renderWithProviders(<Sidebar />);

    expect(screen.getByTestId('mobile-sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-sidebar')).not.toBeInTheDocument();
  });

  it('renders MobileSidebar when isEdulutionApp is true', () => {
    usePlatformStore.setState({ isEdulutionApp: true });

    renderWithProviders(<Sidebar />);

    expect(screen.getByTestId('mobile-sidebar')).toBeInTheDocument();
  });

  it('always renders NotificationPanel', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
  });

  it('passes sidebarItems to DesktopSidebar on desktop', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByText('File Sharing')).toBeInTheDocument();
    expect(screen.getByText('Mail')).toBeInTheDocument();
  });

  it('passes sidebarItems to MobileSidebar on mobile', () => {
    vi.mocked(useMedia).mockReturnValue({ isMobileView: true, isTabletView: false });

    renderWithProviders(<Sidebar />);

    expect(screen.getByText('File Sharing')).toBeInTheDocument();
    expect(screen.getByText('Mail')).toBeInTheDocument();
  });
});
