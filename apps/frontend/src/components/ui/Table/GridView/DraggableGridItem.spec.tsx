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

vi.mock('@/components/ui/Checkbox', () => ({
  default: ({ checked, onCheckboxClick, disabled }: any) => (
    <input
      data-testid="grid-checkbox"
      type="checkbox"
      checked={checked}
      onChange={() => onCheckboxClick?.({ stopPropagation: vi.fn() })}
      disabled={disabled}
    />
  ),
}));

vi.mock('@/components/shared/Card/Card', () => ({
  Card: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="grid-card"
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
  CardContent: ({ children, className }: any) => (
    <div
      data-testid="grid-card-content"
      className={className}
    >
      {children}
    </div>
  ),
}));

vi.mock('@libs/ui/constants/tableGridSizes', () => ({
  GRID_ITEM_WIDTH: 180,
}));

vi.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }: any) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DraggableGridItem from './DraggableGridItem';

const createMockRow = (overrides: Record<string, any> = {}) => ({
  id: 'row-1',
  original: { id: '1', name: 'Test Item' },
  getIsSelected: vi.fn(() => false),
  toggleSelected: vi.fn(),
  ...overrides,
});

describe('DraggableGridItem', () => {
  it('renders the grid item with title', () => {
    const row = createMockRow();
    render(
      <DraggableGridItem
        row={row as any}
        renderIcon={() => <span data-testid="icon" />}
        renderTitle={(item: any) => item.name}
      />,
    );
    const titles = screen.getAllByText('Test Item');
    expect(titles.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders the checkbox when enableRowSelection is true', () => {
    const row = createMockRow();
    render(
      <DraggableGridItem
        row={row as any}
        renderIcon={() => <span />}
        renderTitle={(item: any) => item.name}
        enableRowSelection
      />,
    );
    expect(screen.getByTestId('grid-checkbox')).toBeInTheDocument();
  });

  it('does not render checkbox when enableRowSelection is false', () => {
    const row = createMockRow();
    render(
      <DraggableGridItem
        row={row as any}
        renderIcon={() => <span />}
        renderTitle={(item: any) => item.name}
        enableRowSelection={false}
      />,
    );
    expect(screen.queryByTestId('grid-checkbox')).not.toBeInTheDocument();
  });

  it('calls onItemClick when the card is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const row = createMockRow();
    render(
      <DraggableGridItem
        row={row as any}
        renderIcon={() => <span />}
        renderTitle={(item: any) => item.name}
        onItemClick={handleClick}
      />,
    );
    await user.click(screen.getByTestId('grid-card'));
    expect(handleClick).toHaveBeenCalledWith({ id: '1', name: 'Test Item' });
  });
});
