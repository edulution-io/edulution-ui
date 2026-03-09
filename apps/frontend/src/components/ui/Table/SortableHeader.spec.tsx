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

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));
vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/components/ui/Checkbox', () => ({
  default: (props: any) => (
    <input
      data-testid="checkbox"
      type="checkbox"
      checked={props.checked === true}
      onChange={() => props.onCheckedChange?.(!props.checked)}
      aria-label={props['aria-label']}
    />
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SortableHeader from './SortableHeader';

const createMockColumn = (overrides: Record<string, any> = {}) => ({
  id: 'name',
  getCanSort: vi.fn(() => true),
  getIsSorted: vi.fn(() => false),
  toggleSorting: vi.fn(),
  columnDef: { meta: { translationId: 'columns.name' } },
  ...overrides,
});

const createMockTable = (overrides: Record<string, any> = {}) => ({
  getIsAllPageRowsSelected: vi.fn(() => false),
  getIsSomePageRowsSelected: vi.fn(() => false),
  toggleAllPageRowsSelected: vi.fn(),
  ...overrides,
});

describe('SortableHeader', () => {
  it('renders label from column translationId', () => {
    const column = createMockColumn();
    render(<SortableHeader column={column as any} />);

    expect(screen.getByText('columns.name')).toBeInTheDocument();
  });

  it('renders sort button when column is sortable', () => {
    const column = createMockColumn();
    render(<SortableHeader column={column as any} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders span instead of button when column is not sortable', () => {
    const column = createMockColumn({ getCanSort: vi.fn(() => false) });
    render(<SortableHeader column={column as any} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('columns.name')).toBeInTheDocument();
  });

  it('calls toggleSorting when sort button is clicked', async () => {
    const user = userEvent.setup();
    const column = createMockColumn();
    render(<SortableHeader column={column as any} />);

    await user.click(screen.getByRole('button'));
    expect(column.toggleSorting).toHaveBeenCalledWith(false);
  });

  it('renders checkbox when table prop is provided', () => {
    const column = createMockColumn();
    const table = createMockTable();
    render(
      <SortableHeader
        column={column as any}
        table={table as any}
      />,
    );

    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });

  it('hides label when hidden prop is true', () => {
    const column = createMockColumn();
    render(
      <SortableHeader
        column={column as any}
        hidden
      />,
    );

    expect(screen.queryByText('columns.name')).not.toBeInTheDocument();
  });

  it('shows sort icon when column is currently sorted', () => {
    const column = createMockColumn({ getIsSorted: vi.fn(() => 'asc') });
    render(<SortableHeader column={column as any} />);

    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });
});
