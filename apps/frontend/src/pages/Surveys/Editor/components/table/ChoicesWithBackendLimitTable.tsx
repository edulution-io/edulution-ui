import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAddCircleOutline } from 'react-icons/md';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/Table';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Button } from '@/components/shared/Button';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  addNewChoice: () => void;
}

const ChoicesWithBackendLimitTable = <TData, TValue>({
  columns,
  data,
  addNewChoice,
}: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { t } = useTranslation();

  const table = useReactTable({
    data,
    columns,
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full flex-1">
      <ScrollArea className="overflow-auto scrollbar-thin">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="text-left text-foreground"
              >
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
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="m-0 p-0 text-left text-foreground"
                    >
                      <div className="mx-1 my-1 flex justify-center">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
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
                  {t('table.noDataAvailable')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableCell
              colSpan={columns.length - 1}
              className="m-0 p-0"
            />
            <TableCell
              colSpan={1}
              className="m-0 p-0"
            >
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={addNewChoice}
                  variant="btn-outline"
                  className="my-1 flex max-h-[2.25rem] w-[80px] items-center justify-center rounded-md text-foreground"
                >
                  <MdAddCircleOutline />
                </Button>
              </div>
            </TableCell>
          </TableFooter>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default ChoicesWithBackendLimitTable;
