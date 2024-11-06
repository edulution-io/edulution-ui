import React, { SetStateAction, useState } from 'react';
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
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

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

  const [columnWidths] = useState(() =>
    columns.reduce(
      (acc, column) => {
        acc[column.id as string] = 150;
        return acc;
      },
      {} as { [key: string]: number },
    ),
  );

  // const handleResize = (columnId: string, width: number) => {
  //   setColumnWidths((prevWidths) => ({
  //     ...prevWidths,
  //     [columnId]: width,
  //   }));
  // };

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

        {/* Header Container */}
        <div
          className="sticky top-0 flex rounded-md bg-gray-800 p-2 shadow-md"
          id="table-header"
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <div
              key={headerGroup.id}
              className="flex w-full"
            >
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  style={{ width: columnWidths[header.id] || 150 }}
                  className="px-2 font-semibold text-white"
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Data Rows */}
        <ScrollArea className="max-h-[65vh] flex-1 overflow-auto scrollbar-thin">
          <div className="w-full">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className="flex border-b border-gray-700"
                >
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      style={{ width: columnWidths[cell.column.id] || 150 }}
                      className="px-2 py-2 text-white"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="flex h-24 items-center justify-center text-center text-white">{noDataMessage}</div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default ScrollableTable;
