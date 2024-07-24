import React, { useEffect, useState } from 'react';
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
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useTranslation } from 'react-i18next';
import { DirectoryFile } from '@libs/filesharing/types/filesystem';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const FileSharingTable = <TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { setSelectedItems } = useFileSharingStore();
  const { t } = useTranslation();
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(useFileSharingStore.getState().selectedRows)
        : updaterOrValue;
    useFileSharingStore.getState().setSelectedRows(newValue);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: handleRowSelectionChange,
    state: {
      sorting,
      rowSelection: useFileSharingStore((state) => state.selectedRows),
    },
  });

  useEffect(() => {
    const selectedItemFilenames = table.getFilteredSelectedRowModel().rows.map((row) => row.original as DirectoryFile);
    setSelectedItems(selectedItemFilenames);
  }, [table.getFilteredSelectedRowModel().rows]);

  return (
    <>
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <div className="flex-1 text-sm text-background text-muted-foreground">
          {t('table.rowsSelected', {
            selected: table.getFilteredSelectedRowModel().rows.length,
            total: table.getFilteredRowModel().rows.length,
          })}
        </div>
      ) : (
        <div className="flex-1 text-sm">&nbsp;</div>
      )}

      <div className=" w-full flex-1  pl-3 pr-3.5">
        <ScrollArea className="max-h-[75vh] overflow-auto">
          <Table>
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
            <TableBody className="container">
              {table.getRowModel().rows.length ? (
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
                    className="h-24 text-center"
                  >
                    {t('table.noDataAvailable')}
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

export default FileSharingTable;
