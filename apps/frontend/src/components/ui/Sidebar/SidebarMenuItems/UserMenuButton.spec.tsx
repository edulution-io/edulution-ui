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

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockHandleLogout = vi.fn();
vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    user: {
      profile: { given_name: 'John', family_name: 'Doe' },
    },
  }),
}));
vi.mock('@libs/userSettings/constants/user-settings-endpoints', () => ({
  USER_SETTINGS_USER_DETAILS_PATH: '/user-settings/details',
}));

let capturedDropdownItems: any[] = [];
vi.mock('@/components/shared/DropdownMenu', () => ({
  default: ({ trigger, items }: any) => {
    capturedDropdownItems = items;
    return <div data-testid="dropdown-menu">{trigger}</div>;
  },
}));
vi.mock('@/components/shared/Avatar', () => ({
  default: ({ user, imageSrc }: any) => (
    <div
      data-testid="avatar"
      data-username={user?.username}
    />
  ),
}));
vi.mock('@/hooks/useLogout', () => ({
  default: () => mockHandleLogout,
}));
vi.mock('@/store/UserStore/useUserStore', () => ({
  default: vi.fn(() => ({ user: { username: 'jdoe', firstName: 'John', lastName: 'Doe' } })),
}));
vi.mock('@/store/useLmnApiStore', () => ({
  default: vi.fn(() => ({ user: { thumbnailPhoto: 'photo-url' } })),
}));
vi.mock('@/store/EduApiStore/usePlatformStore', () => ({
  default: (selector: any) => selector({ isEdulutionApp: false }),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import UserMenuButton from './UserMenuButton';

describe('UserMenuButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedDropdownItems = [];
  });

  it('renders user name from auth profile', () => {
    render(<UserMenuButton />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders avatar with username', () => {
    render(<UserMenuButton />);
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-username', 'jdoe');
  });

  it('provides user settings menu item that navigates', () => {
    render(<UserMenuButton />);
    const settingsItem = capturedDropdownItems.find((i: any) => i.label === 'usersettings.sidebar');
    settingsItem.onClick();
    expect(mockNavigate).toHaveBeenCalledWith('/user-settings/details');
  });

  it('provides logout menu item that calls handleLogout', () => {
    render(<UserMenuButton />);
    const logoutItem = capturedDropdownItems.find((i: any) => i.label === 'common.logout');
    logoutItem.onClick();
    expect(mockHandleLogout).toHaveBeenCalled();
  });

  it('includes a separator between settings and logout', () => {
    render(<UserMenuButton />);
    const separator = capturedDropdownItems.find((i: any) => i.isSeparator);
    expect(separator).toBeDefined();
  });
});
