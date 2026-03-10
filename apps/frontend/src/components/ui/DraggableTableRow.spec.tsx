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

vi.mock('@dnd-kit/core', () => ({
  useDraggable: () => ({
    attributes: { 'data-draggable': 'true' },
    listeners: {},
    setNodeRef: vi.fn(),
    isDragging: false,
  }),
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: false,
  }),
}));

vi.mock('@tanstack/react-table', () => ({}));

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

vi.mock('@/components/ui/Table', () => ({
  TableRow: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <tr
      ref={ref}
      data-testid="table-row"
      className={className}
      {...props}
    >
      {children}
    </tr>
  )),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DraggableTableRow from './DraggableTableRow';

const createMockRow = (overrides: Record<string, any> = {}) => ({
  id: 'row-1',
  original: { id: '1', name: 'Item A' },
  getIsSelected: vi.fn(() => false),
  ...overrides,
});

describe('DraggableTableRow', () => {
  it('renders children inside a table row', () => {
    const row = createMockRow();
    render(
      <table>
        <tbody>
          <DraggableTableRow
            row={row as any}
            enableDragAndDrop={false}
          >
            <td>Cell content</td>
          </DraggableTableRow>
        </tbody>
      </table>,
    );
    expect(screen.getByText('Cell content')).toBeInTheDocument();
    expect(screen.getByTestId('table-row')).toBeInTheDocument();
  });

  it('sets data-state to selected when row is selected', () => {
    const row = createMockRow({ getIsSelected: vi.fn(() => true) });
    render(
      <table>
        <tbody>
          <DraggableTableRow
            row={row as any}
            enableDragAndDrop={false}
          >
            <td>Cell</td>
          </DraggableTableRow>
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('table-row').getAttribute('data-state')).toBe('selected');
  });

  it('sets data-disabled when row is disabled', () => {
    const row = createMockRow();
    render(
      <table>
        <tbody>
          <DraggableTableRow
            row={row as any}
            enableDragAndDrop={false}
            isRowDisabled
          >
            <td>Cell</td>
          </DraggableTableRow>
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('table-row').getAttribute('data-disabled')).toBe('true');
  });

  it('calls onRowClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const row = createMockRow();
    render(
      <table>
        <tbody>
          <DraggableTableRow
            row={row as any}
            enableDragAndDrop={false}
            onRowClick={handleClick}
          >
            <td>Cell</td>
          </DraggableTableRow>
        </tbody>
      </table>,
    );
    await user.click(screen.getByTestId('table-row'));
    expect(handleClick).toHaveBeenCalledWith({ id: '1', name: 'Item A' });
  });
});
