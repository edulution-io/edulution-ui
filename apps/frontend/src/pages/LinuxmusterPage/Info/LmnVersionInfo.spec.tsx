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

const mockGetLmnVersion = vi.fn();

vi.mock('@/store/useLmnApiStore', () => ({
  default: vi.fn(() => ({
    lmnVersions: {},
    isGetVersionLoading: false,
    getLmnVersion: mockGetLmnVersion,
  })),
}));

vi.mock('@/hooks/useLdapGroups', () => ({
  default: vi.fn(() => ({
    isSuperAdmin: false,
    ldapGroups: [],
    isAuthReady: true,
  })),
}));

vi.mock('@/components/shared/Card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div
      data-testid="card"
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/BadgeSH', () => ({
  BadgeSH: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import useLmnApiStore from '@/store/useLmnApiStore';
import useLdapGroups from '@/hooks/useLdapGroups';
import LmnVersionInfo from './LmnVersionInfo';

describe('LmnVersionInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useLmnApiStore as any).mockReturnValue({
      lmnVersions: {},
      isGetVersionLoading: false,
      getLmnVersion: mockGetLmnVersion,
    });
    (useLdapGroups as any).mockReturnValue({
      isSuperAdmin: false,
      ldapGroups: [],
      isAuthReady: true,
    });
  });

  it('renders version entries as cards with badges', () => {
    (useLmnApiStore as any).mockReturnValue({
      lmnVersions: {
        'linuxmuster-base7': '7.2.0',
        'linuxmuster-api7': '7.3.28',
      },
      isGetVersionLoading: false,
      getLmnVersion: mockGetLmnVersion,
    });

    render(<LmnVersionInfo />);

    expect(screen.getByText('linuxmuster-base7')).toBeInTheDocument();
    expect(screen.getByText('7.2.0')).toBeInTheDocument();
    expect(screen.getByText('linuxmuster-api7')).toBeInTheDocument();
    expect(screen.getByText('7.3.28')).toBeInTheDocument();
  });

  it('calls getLmnVersion when isSuperAdmin is true', () => {
    (useLdapGroups as any).mockReturnValue({
      isSuperAdmin: true,
      ldapGroups: ['/admins'],
      isAuthReady: true,
    });

    render(<LmnVersionInfo />);

    expect(mockGetLmnVersion).toHaveBeenCalledTimes(1);
  });

  it('does not call getLmnVersion when not superAdmin', () => {
    (useLdapGroups as any).mockReturnValue({
      isSuperAdmin: false,
      ldapGroups: ['/teachers'],
      isAuthReady: true,
    });

    render(<LmnVersionInfo />);

    expect(mockGetLmnVersion).not.toHaveBeenCalled();
  });

  it('shows loading indicator when version is loading and no value', () => {
    (useLmnApiStore as any).mockReturnValue({
      lmnVersions: { 'linuxmuster-api7': '' },
      isGetVersionLoading: true,
      getLmnVersion: mockGetLmnVersion,
    });

    render(<LmnVersionInfo />);

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('shows version value even when loading if value exists', () => {
    (useLmnApiStore as any).mockReturnValue({
      lmnVersions: { 'linuxmuster-api7': '7.3.28' },
      isGetVersionLoading: true,
      getLmnVersion: mockGetLmnVersion,
    });

    render(<LmnVersionInfo />);

    expect(screen.getByText('7.3.28')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });
});
