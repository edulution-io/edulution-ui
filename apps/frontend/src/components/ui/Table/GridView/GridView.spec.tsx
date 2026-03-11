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
vi.mock('./DraggableGridItem', () => ({
  default: ({ row, renderTitle, renderIcon, isDisabled, enableRowSelection }: any) => (
    <div
      data-testid={`grid-item-${row.id}`}
      data-disabled={isDisabled}
      data-selectable={enableRowSelection}
    >
      <span data-testid="grid-title">{renderTitle(row.original)}</span>
      <span data-testid="grid-icon">{renderIcon(row.original)}</span>
    </div>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import GridView from './GridView';

const createMockRow = (id: string, original: Record<string, any> = {}) => ({
  id,
  original: { name: `Item ${id}`, ...original },
  getIsSelected: vi.fn(() => false),
});

const defaultGridItemConfig = {
  renderIcon: (item: any) => <span>{item.name}-icon</span>,
  renderTitle: (item: any) => item.name,
};

describe('GridView', () => {
  it('renders no data message when rows array is empty', () => {
    render(
      <GridView
        rows={[]}
        gridItemConfig={defaultGridItemConfig}
      />,
    );

    expect(screen.getByText('table.noDataAvailable')).toBeInTheDocument();
  });

  it('renders grid items for each row', () => {
    const rows = [createMockRow('1'), createMockRow('2')];
    render(
      <GridView
        rows={rows as any}
        gridItemConfig={defaultGridItemConfig}
      />,
    );

    expect(screen.getByTestId('grid-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('grid-item-2')).toBeInTheDocument();
  });

  it('passes disabled state from getRowDisabled', () => {
    const rows = [createMockRow('1')];
    const getRowDisabled = vi.fn(() => true);
    render(
      <GridView
        rows={rows as any}
        gridItemConfig={defaultGridItemConfig}
        getRowDisabled={getRowDisabled}
      />,
    );

    expect(screen.getByTestId('grid-item-1')).toHaveAttribute('data-disabled', 'true');
  });

  it('enables row selection by default', () => {
    const rows = [createMockRow('1')];
    render(
      <GridView
        rows={rows as any}
        gridItemConfig={defaultGridItemConfig}
      />,
    );

    expect(screen.getByTestId('grid-item-1')).toHaveAttribute('data-selectable', 'true');
  });

  it('evaluates enableRowSelection function per row', () => {
    const rows = [createMockRow('1')];
    const enableRowSelection = vi.fn(() => false);
    render(
      <GridView
        rows={rows as any}
        gridItemConfig={defaultGridItemConfig}
        enableRowSelection={enableRowSelection}
      />,
    );

    expect(screen.getByTestId('grid-item-1')).toHaveAttribute('data-selectable', 'false');
  });
});
