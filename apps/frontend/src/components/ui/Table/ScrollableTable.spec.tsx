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

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn(), dismiss: vi.fn() } }));
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ColumnDef } from '@tanstack/react-table';
import renderWithProviders from '@libs/test-utils/providers/renderWithProviders';
import ScrollableTable from './ScrollableTable';

type TestData = {
  id: string;
  name: string;
  email: string;
  status: string;
};

const testColumns: ColumnDef<TestData, string>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

const testData: TestData[] = [
  { id: '1', name: 'Alice', email: 'alice@test.com', status: 'Active' },
  { id: '2', name: 'Bob', email: 'bob@test.com', status: 'Inactive' },
  { id: '3', name: 'Charlie', email: 'charlie@test.com', status: 'Active' },
  { id: '4', name: 'Diana', email: 'diana@test.com', status: 'Active' },
  { id: '5', name: 'Eve', email: 'eve@test.com', status: 'Inactive' },
];

const defaultProps = {
  columns: testColumns,
  data: testData,
  filterKey: 'name',
  filterPlaceHolderText: 'common.search',
  applicationName: 'test-app',
  getRowId: (row: TestData) => row.id,
};

describe('ScrollableTable', () => {
  it('renders column headers from column definitions', () => {
    renderWithProviders(<ScrollableTable {...defaultProps} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders all data rows', () => {
    renderWithProviders(<ScrollableTable {...defaultProps} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Diana')).toBeInTheDocument();
    expect(screen.getByText('Eve')).toBeInTheDocument();
  });

  it('filters rows when typing in filter input', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ScrollableTable {...defaultProps} />);

    const filterInput = screen.getByPlaceholderText('common.search');
    await user.type(filterInput, 'Alice');

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('hides search bar when showSearchBarAndColumnSelect is false', () => {
    renderWithProviders(
      <ScrollableTable
        {...defaultProps}
        showSearchBarAndColumnSelect={false}
      />,
    );

    expect(screen.queryByPlaceholderText('common.search')).not.toBeInTheDocument();
  });

  it('shows LoadingIndicatorDialog when isLoading and data is empty', () => {
    renderWithProviders(
      <ScrollableTable
        {...defaultProps}
        data={[]}
        isLoading
      />,
    );

    const portal = document.body.querySelector('.fixed.inset-0');
    expect(portal).toBeInTheDocument();
  });

  it('shows no data message when data is empty and not loading', () => {
    renderWithProviders(
      <ScrollableTable
        {...defaultProps}
        data={[]}
      />,
    );

    expect(screen.getByText('table.noDataAvailable')).toBeInTheDocument();
  });

  it('renders selected rows count component', () => {
    renderWithProviders(<ScrollableTable {...defaultProps} />);

    expect(screen.getByText(/test-app\.items/)).toBeInTheDocument();
  });

  it('renders table headers and body structure', () => {
    const { container } = renderWithProviders(<ScrollableTable {...defaultProps} />);

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();

    const thead = table?.querySelector('thead');
    expect(thead).toBeInTheDocument();

    const tbody = table?.querySelector('tbody');
    expect(tbody).toBeInTheDocument();

    const rows = tbody?.querySelectorAll('tr');
    expect(rows).toHaveLength(5);
  });
});
