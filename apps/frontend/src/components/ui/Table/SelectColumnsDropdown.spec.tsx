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
vi.mock('@libs/ui/constants/commonClassNames', () => ({
  inputVariants: ({ variant }: any) => `input-${variant}`,
}));
vi.mock('@/components/shared/DropdownMenu', () => ({
  default: ({ trigger, items }: any) => (
    <div data-testid="dropdown-menu">
      <div data-testid="dropdown-trigger">{trigger}</div>
      <ul data-testid="dropdown-items">
        {items.map((item: any) => (
          <li key={item.label}>
            <label>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.onCheckedChange?.(e.target.checked)}
              />
              {item.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectColumnsDropdown from './SelectColumnsDropdown';

const createMockColumn = (overrides: Record<string, any> = {}) => ({
  id: 'name',
  getCanHide: vi.fn(() => true),
  getIsVisible: vi.fn(() => true),
  toggleVisibility: vi.fn(),
  columnDef: { meta: { translationId: 'columns.name' } },
  ...overrides,
});

const createMockTable = (columns: any[] = []) => ({
  getAllColumns: vi.fn(() => columns),
});

describe('SelectColumnsDropdown', () => {
  it('renders the columns button with translated label', () => {
    const table = createMockTable([createMockColumn()]);
    render(<SelectColumnsDropdown table={table as any} />);

    expect(screen.getByText('common.columns')).toBeInTheDocument();
  });

  it('renders dropdown items for hideable columns', () => {
    const columns = [
      createMockColumn({ id: 'name', columnDef: { meta: { translationId: 'columns.name' } } }),
      createMockColumn({ id: 'email', columnDef: { meta: { translationId: 'columns.email' } } }),
    ];
    const table = createMockTable(columns);
    render(<SelectColumnsDropdown table={table as any} />);

    expect(screen.getByText('columns.name')).toBeInTheDocument();
    expect(screen.getByText('columns.email')).toBeInTheDocument();
  });

  it('filters out columns that cannot be hidden', () => {
    const columns = [
      createMockColumn({
        id: 'name',
        getCanHide: vi.fn(() => true),
        columnDef: { meta: { translationId: 'columns.name' } },
      }),
      createMockColumn({
        id: 'actions',
        getCanHide: vi.fn(() => false),
        columnDef: { meta: { translationId: 'columns.actions' } },
      }),
    ];
    const table = createMockTable(columns);
    render(<SelectColumnsDropdown table={table as any} />);

    expect(screen.getByText('columns.name')).toBeInTheDocument();
    expect(screen.queryByText('columns.actions')).not.toBeInTheDocument();
  });

  it('calls toggleVisibility when checkbox is changed', async () => {
    const user = userEvent.setup();
    const column = createMockColumn({ getIsVisible: vi.fn(() => true) });
    const table = createMockTable([column]);
    render(<SelectColumnsDropdown table={table as any} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(column.toggleVisibility).toHaveBeenCalled();
  });

  it('renders checked checkbox for visible columns', () => {
    const column = createMockColumn({ getIsVisible: vi.fn(() => true) });
    const table = createMockTable([column]);
    render(<SelectColumnsDropdown table={table as any} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });
});
