// TODO: Delete after merging: 243 Make table header sticky #248 (https://github.com/edulution-io/edulution-ui/pull/248/files) was merged

import React, { SetStateAction } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { useTranslation } from 'react-i18next';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import useElementHeight from '@/hooks/useElementHeight';

const HEADER_ID = 'default-header-id';
const LOADING_INDICATOR_ID = 'default-loading-indicator-id';
const SELECTED_ROW_MESSAGE_ID = 'default-selected-rows-message-id';
const TABLE_HEADER_ID = 'default-table-header-id';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  selectedRows?: RowSelectionState;
  isLoading?: boolean;
  sorting: SortingState;
  getRowId?: (originalRow: TData) => string;
  setSorting: (sorting: SetStateAction<SortingState>) => void;
  applicationName: string;
  additionalScrollContainerOffset?: number;
  scrollContainerOffsetElementIds?: {
    headerId?: string;
    loadingIndicatorId?: string;
    selectedRowsMessageId?: string;
    tableHeaderId?: string;
    others?: string[];
  };
}

const ScrollableTableTemp = <TData, TValue>({
  columns,
  data,
  onRowSelectionChange,
  isLoading,
  sorting,
  setSorting,
  selectedRows,
  getRowId,
  applicationName,
  additionalScrollContainerOffset,
  scrollContainerOffsetElementIds = {},
}: DataTableProps<TData, TValue>) => {
  const { t } = useTranslation();

  const allElementIds = [
    scrollContainerOffsetElementIds.headerId || HEADER_ID,
    scrollContainerOffsetElementIds.loadingIndicatorId || LOADING_INDICATOR_ID,
    scrollContainerOffsetElementIds.selectedRowsMessageId || SELECTED_ROW_MESSAGE_ID,
    scrollContainerOffsetElementIds.tableHeaderId || TABLE_HEADER_ID,
    ...(scrollContainerOffsetElementIds.others || []),
  ].filter(Boolean);

  const pageBarsHeight = useElementHeight(allElementIds) + (additionalScrollContainerOffset || 0);

  const loadingIndicatorId = scrollContainerOffsetElementIds.loadingIndicatorId || LOADING_INDICATOR_ID;
  const selectedRowsMessageId = scrollContainerOffsetElementIds.selectedRowsMessageId || SELECTED_ROW_MESSAGE_ID;
  const tableHeaderId = scrollContainerOffsetElementIds.tableHeaderId || TABLE_HEADER_ID;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getRowId: getRowId || ((originalRow: TData) => (originalRow as unknown as { id: string }).id),
    onRowSelectionChange,
    state: {
      sorting,
      rowSelection: selectedRows,
    },
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <>
      {isLoading && data?.length === 0 ? (
        <LoadingIndicator
          isOpen={isLoading}
          id={loadingIndicatorId}
        />
      ) : null}

      {selectedRowsCount > 0 ? (
        <div
          id={selectedRowsMessageId}
          className="flex-1 text-sm text-muted-foreground text-white"
        >
          {selectedRowsCount === 1
            ? t(`${applicationName}.rowSelected`, {
                selected: selectedRowsCount,
                total: table.getFilteredRowModel().rows.length,
              })
            : t(`${applicationName}.rowsSelected`, {
                selected: selectedRowsCount,
                total: table.getFilteredRowModel().rows.length,
              })}
        </div>
      ) : (
        <div className="flex-1 text-sm text-muted-foreground text-white">&nbsp;</div>
      )}

      <div
        className="w-full flex-1 overflow-auto pl-3 pr-3.5 scrollbar-thin"
        style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      >
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
                  colSpan={data?.length}
                  className="h-24 text-center text-white"
                >
                  {t('table.noDataAvailable')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default ScrollableTableTemp;
