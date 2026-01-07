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

import React, { ReactNode } from 'react';
import { ColumnDef, flexRender, OnChangeFn, Row, RowSelectionState, VisibilityState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import TableAction from '@libs/common/types/tableAction';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import Input from '@/components/shared/Input';
import SelectColumnsDropdown from '@/components/ui/Table/SelectColumnsDropdown';
import TABLE_DEFAULT_COLUMN_WIDTH from '@libs/ui/constants/tableDefaultColumnWidth';
import TableActionFooter from '@/components/ui/Table/TableActionFooter';
import DraggableTableRow from '@/components/ui/DraggableTableRow';
import useScrollableTable from '@/components/ui/Table/useScrollableTable';
import SelectedRowsCount from '@/components/ui/Table/SelectedRowsCount';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey: string;
  filterPlaceHolderText: string;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  selectedRows?: RowSelectionState;
  isLoading?: boolean;
  getRowId?: (originalRow: TData) => string;
  applicationName: string;
  initialSorting?: { id: string; desc: boolean }[];
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean) | undefined;
  initialColumnVisibility?: VisibilityState;
  showHeader?: boolean;
  showSelectedCount?: boolean;
  isDialog?: boolean;
  actions?: TableAction<TData>[];
  showSearchBarAndColumnSelect?: boolean;
  getRowDisabled?: (row: Row<TData>) => boolean;
  enableDragAndDrop?: boolean;
  canDropOnRow?: (row: TData) => boolean;
  searchBarAdditionalComponent?: ReactNode;
}

const ScrollableTable = <TData, TValue>({
  columns,
  data,
  filterKey,
  filterPlaceHolderText,
  onRowSelectionChange,
  isLoading,
  selectedRows = {},
  getRowId,
  applicationName,
  enableRowSelection,
  initialSorting,
  showHeader = true,
  showSelectedCount = true,
  isDialog = false,
  initialColumnVisibility = {},
  actions,
  showSearchBarAndColumnSelect = true,
  getRowDisabled,
  enableDragAndDrop = false,
  canDropOnRow,
  searchBarAdditionalComponent,
}: DataTableProps<TData, TValue>) => {
  const { t } = useTranslation();

  const { table } = useScrollableTable({
    columns,
    data,
    onRowSelectionChange,
    selectedRows,
    getRowId,
    enableRowSelection,
    initialSorting,
    initialColumnVisibility,
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const filterValue = String(table.getColumn(filterKey)?.getFilterValue() || '');

  return (
    <>
      {isLoading && data?.length === 0 ? <LoadingIndicatorDialog isOpen={isLoading} /> : null}

      {showSelectedCount && (
        <SelectedRowsCount
          applicationName={applicationName}
          selectedRowsCount={selectedRowsCount}
          filteredRowCount={filteredRowCount}
        />
      )}

      <div className="h-full w-full flex-1 overflow-auto pr-1 scrollbar-thin">
        {!!data.length && showSearchBarAndColumnSelect && (
          <div className="flex items-center gap-2 pb-4 pt-2">
            <div className="min-w-0 flex-1">
              <Input
                placeholder={t(filterPlaceHolderText)}
                value={filterValue}
                onChange={(e) => table.getColumn(filterKey)?.setFilterValue(e.target.value)}
                variant={isDialog ? 'dialog' : 'default'}
              />
            </div>

            {table.getAllColumns().length > 1 && (
              <SelectColumnsDropdown
                table={table}
                isDialog={isDialog}
              />
            )}

            {searchBarAdditionalComponent}
          </div>
        )}
        <Table>
          {showHeader && (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  variant={isDialog ? 'dialog' : 'default'}
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{
                        width:
                          header.column.columnDef.size !== TABLE_DEFAULT_COLUMN_WIDTH
                            ? `${header.column.columnDef.size}px`
                            : '',
                      }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          )}
          <TableBody className="container">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const isRowDisabled = getRowDisabled?.(row);

                return (
                  <DraggableTableRow
                    key={row.id}
                    row={row}
                    isRowDisabled={isRowDisabled}
                    enableDragAndDrop={enableDragAndDrop}
                    canDropOnRow={canDropOnRow}
                    variant={isDialog ? 'dialog' : 'default'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={`${row.id}-${cell.column.id}`}
                        className={`${isRowDisabled ? 'opacity-70' : ''}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </DraggableTableRow>
                );
              })
            ) : (
              <TableRow variant={isDialog ? 'dialog' : 'default'}>
                <TableCell
                  colSpan={columns?.length}
                  className="h-24 text-center"
                >
                  {t('table.noDataAvailable')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableActionFooter
            actions={actions}
            columnLength={table.getAllColumns().length}
          />
        </Table>
      </div>
    </>
  );
};

export default ScrollableTable;
