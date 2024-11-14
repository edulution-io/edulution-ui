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
import { HEADER_ID, SELECTED_ROW_MESSAGE_ID, TABLE_HEADER_ID } from '@libs/ui/constants/defaultIds';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
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
  textColorClass?: string;
  showHeader?: boolean;
}

const ScrollableTable = <TData,>({
  columns,
  data,
  onRowSelectionChange,
  isLoading,
  sorting,
  setSorting,
  selectedRows,
  getRowId,
  applicationName,
  additionalScrollContainerOffset = 0,
  scrollContainerOffsetElementIds = {},
  textColorClass = 'text-white',
  showHeader = true,
}: DataTableProps<TData>) => {
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
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getRowId: getRowId || ((originalRow: TData) => (originalRow as { id: string }).id),
    onRowSelectionChange,
    state: {
      sorting,
      rowSelection: selectedRows,
    },
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <>
      {isLoading && data?.length === 0 ? <LoadingIndicator isOpen={isLoading} /> : null}

      {selectedRowsCount > 0 ? (
        <div
          id={selectedRowsMessageId}
          className="flex-1 text-sm text-muted-foreground text-white"
        >
          {selectedRowsCount > 0 ? (
            t(`${applicationName}.${selectedRowsCount === 1 ? 'rowSelected' : 'rowsSelected'}`, {
              selected: selectedRowsCount,
              total: table.getFilteredRowModel().rows.length,
            })
          ) : (
            <>&nbsp;</>
          )}
        </div>
      ) : (
        <div className={`flex-1 text-sm ${textColorClass}`}>&nbsp;</div>
      )}

      <div
        className="w-full flex-1 overflow-auto pl-3 pr-3.5 scrollbar-thin"
        style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      >
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
                  colSpan={data?.length}
                  className={`h-24 text-center ${textColorClass}`}
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

export default ScrollableTable;
