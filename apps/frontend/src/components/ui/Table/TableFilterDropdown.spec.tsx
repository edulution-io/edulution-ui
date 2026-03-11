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
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
  inputVariants: ({ variant }: any) => `input-${variant}`,
  Button: ({ children, className, ...props }: any) => (
    <button
      type="button"
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));
vi.mock('@libs/ui/constants/notificationCounterVariants', () => ({
  default: { PRIMARY: 'primary' },
}));
vi.mock('@/components/ui/Sidebar/SidebarMenuItems/NotificationCounter', () => ({
  default: ({ count, className }: any) => (count > 0 ? <span data-testid="notification-counter">{count}</span> : null),
}));
vi.mock('@/components/shared/DropdownMenu', () => ({
  default: ({ trigger, items }: any) => (
    <div data-testid="dropdown-menu">
      <div data-testid="dropdown-trigger">{trigger}</div>
      <ul data-testid="dropdown-items">
        {items
          .filter((item: any) => !item.isSeparator)
          .map((item: any) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={item.onClick || (() => item.onCheckedChange?.(!item.checked))}
              >
                {item.label}
              </button>
            </li>
          ))}
      </ul>
    </div>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TableFilterDropdown from './TableFilterDropdown';

const createFilterOption = (overrides: Record<string, any> = {}) => ({
  key: 'status',
  translationKey: 'filters.status',
  checked: false,
  onChange: vi.fn(),
  isSeparator: false,
  ...overrides,
});

describe('TableFilterDropdown', () => {
  it('renders filter button with translated label', () => {
    render(<TableFilterDropdown filterOptions={[createFilterOption()]} />);

    expect(screen.getByText('common.filter')).toBeInTheDocument();
  });

  it('renders dropdown items for each filter option', () => {
    const options = [
      createFilterOption({ key: 'status', translationKey: 'filters.status' }),
      createFilterOption({ key: 'type', translationKey: 'filters.type' }),
    ];
    render(<TableFilterDropdown filterOptions={options} />);

    expect(screen.getByText('filters.status')).toBeInTheDocument();
    expect(screen.getByText('filters.type')).toBeInTheDocument();
  });

  it('shows notification counter when activeFilterCount is greater than 0', () => {
    render(
      <TableFilterDropdown
        filterOptions={[createFilterOption()]}
        activeFilterCount={3}
      />,
    );

    expect(screen.getByTestId('notification-counter')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not show notification counter when activeFilterCount is 0', () => {
    render(
      <TableFilterDropdown
        filterOptions={[createFilterOption()]}
        activeFilterCount={0}
      />,
    );

    expect(screen.queryByTestId('notification-counter')).not.toBeInTheDocument();
  });

  it('renders reset option when activeFilterCount > 0 and onResetFilters is provided', () => {
    const onResetFilters = vi.fn();
    render(
      <TableFilterDropdown
        filterOptions={[createFilterOption()]}
        activeFilterCount={2}
        onResetFilters={onResetFilters}
      />,
    );

    expect(screen.getByText('common.reset')).toBeInTheDocument();
  });
});
