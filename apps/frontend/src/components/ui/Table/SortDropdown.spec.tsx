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
vi.mock('@/components/shared/DropdownMenu', () => ({
  default: ({ trigger, items }: any) => (
    <div data-testid="dropdown-menu">
      <div data-testid="dropdown-trigger">{trigger}</div>
      <ul data-testid="dropdown-items">
        {items.map((item: any) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={item.onClick}
              data-checked={item.checked}
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
import SortDropdown from './SortDropdown';

const createMockColumn = (overrides: Record<string, any> = {}) => ({
  id: 'name',
  getCanSort: vi.fn(() => true),
  toggleSorting: vi.fn(),
  columnDef: { meta: { translationId: 'columns.name' } },
  ...overrides,
});

const createMockTable = (columns: any[] = [], sorting: any[] = []) => ({
  getAllColumns: vi.fn(() => columns),
  getState: vi.fn(() => ({ sorting })),
});

describe('SortDropdown', () => {
  it('renders null when no sortable columns exist', () => {
    const table = createMockTable([]);
    const { container } = render(<SortDropdown table={table as any} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders sort button with translated label', () => {
    const column = createMockColumn();
    const table = createMockTable([column]);
    render(<SortDropdown table={table as any} />);

    expect(screen.getByText('common.sort')).toBeInTheDocument();
  });

  it('renders ascending and descending items for each sortable column', () => {
    const column = createMockColumn();
    const table = createMockTable([column]);
    render(<SortDropdown table={table as any} />);

    expect(screen.getByText('columns.name (common.ascending)')).toBeInTheDocument();
    expect(screen.getByText('columns.name (common.descending)')).toBeInTheDocument();
  });

  it('calls toggleSorting with false for ascending', async () => {
    const user = userEvent.setup();
    const column = createMockColumn();
    const table = createMockTable([column]);
    render(<SortDropdown table={table as any} />);

    await user.click(screen.getByText('columns.name (common.ascending)'));
    expect(column.toggleSorting).toHaveBeenCalledWith(false);
  });

  it('calls toggleSorting with true for descending', async () => {
    const user = userEvent.setup();
    const column = createMockColumn();
    const table = createMockTable([column]);
    render(<SortDropdown table={table as any} />);

    await user.click(screen.getByText('columns.name (common.descending)'));
    expect(column.toggleSorting).toHaveBeenCalledWith(true);
  });
});
