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

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) =>
    args
      .flatMap((arg: any) => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object' && arg !== null) {
          return Object.entries(arg)
            .filter(([, v]) => v)
            .map(([k]) => k);
        }
        return [];
      })
      .filter(Boolean)
      .join(' '),
}));

vi.mock('@/utils/copyToClipboard', () => ({
  default: vi.fn(),
}));

vi.mock('@/pages/UserSettings/Security/components/PasswordCell', () => ({
  default: ({ accountPassword }: any) => <span data-testid="password-cell">{accountPassword}</span>,
}));

vi.mock('@/components/shared/InputWithActionIcons', () => ({
  default: ({ value, ...props }: any) => (
    <input
      data-testid="input-action"
      value={value}
      readOnly
    />
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserAccountsToastContent from './UserAccountsToastContent';

const mockAccounts = [
  { accountId: '1', appName: 'App1', accountUser: 'user1', accountPassword: 'pass1' },
  { accountId: '2', appName: 'App2', accountUser: 'user2', accountPassword: 'pass2' },
];

describe('UserAccountsToastContent', () => {
  it('renders the toggle button with translation key', () => {
    render(
      <UserAccountsToastContent
        userAccounts={mockAccounts}
        isCollapsed
        onToggleCollapse={vi.fn()}
      />,
    );
    expect(screen.getByText('usersettings.security.accountData')).toBeInTheDocument();
  });

  it('renders user account inputs for each account', () => {
    render(
      <UserAccountsToastContent
        userAccounts={mockAccounts}
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
      />,
    );
    const inputs = screen.getAllByTestId('input-action');
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveValue('user1');
    expect(inputs[1]).toHaveValue('user2');
  });

  it('renders PasswordCell for each account', () => {
    render(
      <UserAccountsToastContent
        userAccounts={mockAccounts}
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
      />,
    );
    const cells = screen.getAllByTestId('password-cell');
    expect(cells).toHaveLength(2);
  });

  it('calls onToggleCollapse when button clicked', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    render(
      <UserAccountsToastContent
        userAccounts={mockAccounts}
        isCollapsed
        onToggleCollapse={handleToggle}
      />,
    );
    await user.click(screen.getByRole('button'));
    expect(handleToggle).toHaveBeenCalledOnce();
  });
});
