/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  OnChangeFn,
  Row,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import useElementHeight from '@/hooks/useElementHeight';
import { HEADER_ID, SELECTED_ROW_MESSAGE_ID, TABLE_HEADER_ID } from '@libs/ui/constants/defaultIds';
import Input from '@/components/shared/Input';

import { Button } from '@/components/shared/Button';
import { ChevronDown } from 'lucide-react';
import DropdownMenu from '@/components/shared/DropdownMenu';
import DEFAULT_TABLE_SORT_PROPERTY_KEY from '@libs/common/constants/defaultTableSortProperty';

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
  additionalScrollContainerOffset?: number;
  scrollContainerOffsetElementIds?: {
    headerId?: string;
    selectedRowsMessageId?: string;
    tableHeaderId?: string;
    others?: string[];
  };
  tableIsUsedOnAppConfigPage?: boolean;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean) | undefined;
  textColorClass?: string;
  showHeader?: boolean;
  showSelectedCount?: boolean;
  footer?: React.ReactNode;
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
  additionalScrollContainerOffset = 0,
  scrollContainerOffsetElementIds = {},
  enableRowSelection,
  tableIsUsedOnAppConfigPage = false,
  textColorClass = 'text-muted-foreground',
  showHeader = true,
  showSelectedCount = true,
  footer,
}: DataTableProps<TData, TValue>) => {
  const { t } = useTranslation();

  const hasPositionCol = useMemo(() => columns.some((c) => c.id === 'position'), [columns]);

  const [sorting, setSorting] = useState(hasPositionCol ? [{ id: DEFAULT_TABLE_SORT_PROPERTY_KEY, desc: false }] : []);

  const selectedRowsMessageId = scrollContainerOffsetElementIds.selectedRowsMessageId || SELECTED_ROW_MESSAGE_ID;
  const tableHeaderId = scrollContainerOffsetElementIds.tableHeaderId || TABLE_HEADER_ID;

  const allScrollContainerOffsetElementIds = [
    scrollContainerOffsetElementIds.headerId || HEADER_ID,
    selectedRowsMessageId,
    tableHeaderId,
    ...(scrollContainerOffsetElementIds.others || []),
  ].filter(Boolean);

  const pageBarsHeight = useElementHeight(allScrollContainerOffsetElementIds) + additionalScrollContainerOffset;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: getRowId || ((originalRow: TData) => (originalRow as { id: string }).id),
    onRowSelectionChange,
    enableRowSelection,
    state: {
      rowSelection: selectedRows,
      sorting,
    },
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const filterValue = String(table.getColumn(filterKey)?.getFilterValue() || '');

  return (
    <>
      {isLoading && data?.length === 0 ? <LoadingIndicator isOpen={isLoading} /> : null}

      {showSelectedCount ? (
        <div
          id={selectedRowsMessageId}
          className="flex-1 text-sm text-muted-foreground"
        >
          {selectedRowsCount > 0 ? (
            t(`${applicationName}.${filteredRowCount === 1 ? 'rowSelected' : 'rowsSelected'}`, {
              selected: selectedRowsCount,
              total: filteredRowCount,
            })
          ) : (
            <>&nbsp;</>
          )}
        </div>
      ) : (
        <>
          {!tableIsUsedOnAppConfigPage && (
            <div
              id={selectedRowsMessageId}
              className={`flex-1 text-sm ${textColorClass}`}
            >
              &nbsp;
            </div>
          )}
          <p />
        </>
      )}

      <div
        className={`w-full flex-1 overflow-auto scrollbar-thin ${!tableIsUsedOnAppConfigPage ? 'pl-3 pr-3.5' : ''}`}
        style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      >
        <div className="w-full">
          {!!data.length && (
            <div className="flex items-center justify-between py-4">
              <Input
                placeholder={t(filterPlaceHolderText)}
                value={filterValue}
                onChange={(event) => table.getColumn(filterKey)?.setFilterValue(event.target.value)}
                className="max-w-xl bg-accent text-secondary"
              />
              <DropdownMenu
                trigger={
                  <Button
                    variant="btn-small"
                    className="ml-auto bg-accent text-secondary"
                  >
                    {t('common.columns')} <ChevronDown />
                  </Button>
                }
                items={table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => ({
                    label: t(column.columnDef.meta?.translationId ?? column.id),
                    isCheckbox: true,
                    checked: column.getIsVisible(),
                    onCheckedChange: (value) => column.toggleVisibility(value),
                  }))}
              />
            </div>
          )}
          <Table>
            {showHeader && (
              <TableHeader
                className={`text-foreground ${textColorClass}`}
                id={tableHeaderId}
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
            )}
            <TableBody className="container">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={`${row.id}-${cell.column.id}`}
                        className={textColorClass}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns?.length}
                    className={`h-24 text-center ${textColorClass}`}
                  >
                    {t('table.noDataAvailable')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {footer && <div className="max-w-[42vh] overflow-hidden text-ellipsis whitespace-nowrap">{footer}</div>}
    </>
  );
};

export default ScrollableTable;
