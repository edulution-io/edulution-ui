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
vi.mock('@libs/common/constants/viewMode', () => ({
  default: { table: 'table', grid: 'grid' },
}));
vi.mock('@libs/ui/utils/pinRowToTop', () => ({
  default: (rows: any[]) => rows,
}));

let mockViewMode = 'table';
const mockSetViewMode = vi.fn();
vi.mock('@/store/useTableViewSettingsStore', () => ({
  default: vi.fn(() => ({
    getViewMode: () => mockViewMode,
    setViewMode: mockSetViewMode,
  })),
}));

vi.mock('./ScrollableTable', () => ({
  default: (props: any) => <div data-testid="scrollable-table" />,
}));
vi.mock('./ViewModeToggle', () => ({
  default: ({ viewMode, onViewModeChange }: any) => (
    <button
      data-testid="view-mode-toggle"
      onClick={() => onViewModeChange(viewMode === 'table' ? 'grid' : 'table')}
    >
      {viewMode}
    </button>
  ),
}));
vi.mock('./SortDropdown', () => ({
  default: () => <div data-testid="sort-dropdown" />,
}));
vi.mock('./GridView/GridView', () => ({
  default: ({ rows }: any) => (
    <div
      data-testid="grid-view"
      data-row-count={rows?.length ?? 0}
    />
  ),
}));
vi.mock('./SelectedRowsCount', () => ({
  default: ({ applicationName, selectedRowsCount, filteredRowCount }: any) => (
    <div data-testid="selected-rows-count">{`${selectedRowsCount}/${filteredRowCount}`}</div>
  ),
}));
vi.mock('./TableFilterDropdown', () => ({
  default: () => <div data-testid="table-filter-dropdown" />,
}));
vi.mock('@/components/ui/Loading/LoadingIndicatorDialog', () => ({
  default: ({ isOpen }: any) => (isOpen ? <div data-testid="loading-dialog" /> : null),
}));
vi.mock('@/components/shared/Input', () => ({
  default: (props: any) => (
    <input
      data-testid="search-input"
      {...props}
    />
  ),
}));
vi.mock('@/components/ui/Checkbox', () => ({
  default: ({ label }: any) => <label data-testid="select-all-checkbox">{label}</label>,
}));
vi.mock('@/components/ui/Table/TableActionFooter', () => ({
  default: () => <div data-testid="table-action-footer" />,
}));

const mockGetFilterValue = vi.fn(() => '');
const mockSetFilterValue = vi.fn();
const mockGetColumn = vi.fn(() => ({
  getFilterValue: mockGetFilterValue,
  setFilterValue: mockSetFilterValue,
}));

vi.mock('./useScrollableTable', () => ({
  default: () => ({
    table: {
      getRowModel: () => ({ rows: [{ id: '1', original: { id: '1', name: 'Item 1' } }] }),
      getFilteredRowModel: () => ({ rows: [{ id: '1', original: { id: '1', name: 'Item 1' } }] }),
      getFilteredSelectedRowModel: () => ({ rows: [] }),
      getColumn: mockGetColumn,
      getIsAllPageRowsSelected: () => false,
      getIsSomePageRowsSelected: () => false,
      toggleAllPageRowsSelected: vi.fn(),
    },
  }),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import TableGridView from './TableGridView';

const defaultProps = {
  columns: [{ accessorKey: 'name', header: 'Name' }] as any[],
  data: [{ id: '1', name: 'Item 1' }],
  filterKey: 'name',
  filterPlaceHolderText: 'Search...',
  applicationName: 'test-app',
  gridItemConfig: { title: (row: any) => row.name },
  viewModeStorageKey: 'test-view-mode',
};

describe('TableGridView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockViewMode = 'table';
  });

  it('renders ScrollableTable in table view mode', () => {
    render(<TableGridView {...defaultProps} />);
    expect(screen.getByTestId('scrollable-table')).toBeInTheDocument();
    expect(screen.queryByTestId('grid-view')).not.toBeInTheDocument();
  });

  it('renders GridView in grid view mode', () => {
    mockViewMode = 'grid';
    render(<TableGridView {...defaultProps} />);
    expect(screen.getByTestId('grid-view')).toBeInTheDocument();
    expect(screen.queryByTestId('scrollable-table')).not.toBeInTheDocument();
  });

  it('renders search input in grid mode when showSearchBar is true', () => {
    mockViewMode = 'grid';
    render(
      <TableGridView
        {...defaultProps}
        showSearchBar
      />,
    );
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('renders SortDropdown in grid mode', () => {
    mockViewMode = 'grid';
    render(<TableGridView {...defaultProps} />);
    expect(screen.getByTestId('sort-dropdown')).toBeInTheDocument();
  });

  it('renders loading dialog when isLoading is true and data is empty', () => {
    mockViewMode = 'grid';
    render(
      <TableGridView
        {...defaultProps}
        data={[]}
        isLoading
      />,
    );
    expect(screen.getByTestId('loading-dialog')).toBeInTheDocument();
  });
});
