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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useElementHeight from '@/hooks/useElementHeight'; // Import the hook

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  noDataMessage?: string;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  selectedRows?: RowSelectionState;
  isLoading?: boolean;
  sorting: SortingState;
  getRowId?: (originalRow: TData) => string;
  setSorting: (sorting: SetStateAction<SortingState>) => void;
  applicationName: string;
}

const ScrollableTable = <TData,>({
  columns,
  data,
  noDataMessage = 'No data available',
  onRowSelectionChange,
  isLoading,
  sorting,
  setSorting,
  selectedRows,
  getRowId,
  applicationName,
}: DataTableProps<TData>) => {
  const { t } = useTranslation();

  // IDs of the elements whose heights you want to consider
  const ELEMENT_IDS = ['table-header', 'selected-rows-message'];
  const pageBarsHeight = useElementHeight(ELEMENT_IDS);

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
      {isLoading && data?.length === 0 && <LoadingIndicator isOpen={isLoading} />}
      <div className="flex h-full w-full flex-col">
        {selectedRowsCount > 0 ? (
          <div id="selected-rows-message">
            {t(`${applicationName}.rowsSelected`, {
              selected: selectedRowsCount,
              total: table.getFilteredRowModel().rows.length,
            })}
          </div>
        ) : (
          <div
            id="placeholder"
            className="invisible"
          >
            {t('table.rowsSelected', {
              selected: 0,
              total: table.getFilteredRowModel().rows.length,
            })}
          </div>
        )}

        <div
          className="sticky top-0"
          id="table-header"
        >
          <Table className="w-full table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="text-background"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          </Table>
        </div>

        <ScrollArea
          className="max-h-[65vh] flex-1 overflow-auto scrollbar-thin"
          style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
        >
          <Table className="w-full table-fixed">
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-background"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-white"
                  >
                    {noDataMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </>
  );
};

export default ScrollableTable;
