import React, { useState } from 'react';
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

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  noDataMessage?: string;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  selectedRowIds?: RowSelectionState;
}

const ScrollableTable = <TData,>({
  columns = [],
  data = [],
  noDataMessage = 'Keine Daten verfügbar',
  onRowSelectionChange,
  selectedRowIds = {},
}: DataTableProps<TData>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { t } = useTranslation();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (newSorting) => {
      setSorting(newSorting);
    },
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange,
    state: {
      sorting,
      rowSelection: selectedRowIds,
    },
  });

  return (
    <div className="flex h-full w-full flex-col">
      {/* Selection Information */}
      {table.getFilteredSelectedRowModel()?.rows.length > 0 && (
        <div className="flex-1 p-2 text-sm text-background">
          {t('table.rowsSelected', {
            selected: table.getFilteredSelectedRowModel()?.rows.length,
            total: table.getFilteredRowModel()?.rows.length,
          })}
        </div>
      )}

      <div className="sticky top-0 z-10">
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

      <ScrollArea className="max-h-[75vh] flex-1 overflow-auto scrollbar-thin">
        <Table className="w-full table-fixed">
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className="cursor-pointer"
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
                  className="h-16 text-center"
                >
                  {noDataMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default ScrollableTable;
