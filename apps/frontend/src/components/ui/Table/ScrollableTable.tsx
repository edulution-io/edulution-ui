import React from 'react';
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
}: DataTableProps<TData, TValue>) => {
  const { t } = useTranslation();

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
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: getRowId || ((originalRow: TData) => (originalRow as { id: string }).id),
    onRowSelectionChange,
    enableRowSelection,
    state: {
      rowSelection: selectedRows,
    },
    autoResetAll: false,
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const filterValue = String(table.getColumn(filterKey)?.getFilterValue() || '');

  return (
    <>
      {isLoading && data?.length === 0 ? <LoadingIndicator isOpen={isLoading} /> : null}

      {selectedRowsCount > 0 ? (
        <div
          id={selectedRowsMessageId}
          className="flex-1 text-sm text-muted-foreground text-white"
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
              className="flex-1 text-sm text-muted-foreground text-white"
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
            <div className="flex items-center py-4">
              <Input
                placeholder={t(filterPlaceHolderText)}
                value={filterValue}
                onChange={(event) => table.getColumn(filterKey)?.setFilterValue(event.target.value)}
                className="max-w-xl bg-ciDarkGrey text-ciLightGrey"
              />
              <DropdownMenu
                trigger={
                  <Button
                    variant="btn-small"
                    className="ml-auto bg-ciDarkGrey text-ciLightGrey"
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
            <TableHeader
              className="text-foreground scrollbar-thin"
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
                        className="text-white"
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
                    className="h-24 text-center text-white"
                  >
                    {t('table.noDataAvailable')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default ScrollableTable;
