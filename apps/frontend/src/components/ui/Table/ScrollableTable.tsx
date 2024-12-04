import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
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
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean) | undefined;
}

const ScrollableTable = <TData, TValue>({
  columns,
  data,
  onRowSelectionChange,
  isLoading,
  selectedRows = {},
  getRowId,
  applicationName,
  additionalScrollContainerOffset = 0,
  scrollContainerOffsetElementIds = {},
  enableRowSelection,
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
    getRowId: getRowId || ((originalRow: TData) => (originalRow as { id: string }).id),
    onRowSelectionChange,
    enableRowSelection,
    state: {
      rowSelection: selectedRows,
    },
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredRowCount = table.getFilteredRowModel().rows.length;

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

export default ScrollableTable;
