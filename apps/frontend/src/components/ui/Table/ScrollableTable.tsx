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
  offset?: number;
  pageElementIds?: {
    headerId?: string;
    loadingIndicatorId?: string;
    selectedRowsMessageId?: string;
    tableHeaderId?: string;
    others?: string[];
  };
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
  offset,
  pageElementIds = {
    headerId: 'default-header-id',
    loadingIndicatorId: 'default-loading-indicator-id',
    selectedRowsMessageId: 'default-selected-rows-message-id',
    tableHeaderId: 'default-table-header-id',
    others: [],
  },
}: DataTableProps<TData>) => {
  const { t } = useTranslation();

  const allElementIds = [
    pageElementIds.headerId,
    pageElementIds.loadingIndicatorId,
    pageElementIds.selectedRowsMessageId,
    pageElementIds.tableHeaderId,
    ...(pageElementIds.others || []),
  ].filter(Boolean) as string[];

  const pageBarsHeight = useElementHeight(allElementIds) + (offset || 0);

  const { loadingIndicatorId, selectedRowsMessageId, tableHeaderId } = pageElementIds;

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
          id={loadingIndicatorId || 'loading-indicator'}
        />
      ) : null}

      {selectedRowsCount > 0 ? (
        <div
          id={selectedRowsMessageId || 'selected-rows-message'}
          className="flex-1 text-sm text-muted-foreground text-white"
        >
          {t(`${applicationName}.rowsSelected`, {
            selected: selectedRowsCount,
            total: table.getFilteredRowModel().rows.length,
          })}
        </div>
      ) : (
        <div className="flex-1 text-sm text-muted-foreground text-white">&nbsp;</div>
      )}

      <div
        className="w-full flex-1 overflow-auto pl-3 pr-3.5"
        style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      >
        <Table>
          <TableHeader
            className="text-foreground"
            id={tableHeaderId || 'table-header'}
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
                      key={`${row.id}-${cell.column.id}`} // Composite key for uniqueness
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
