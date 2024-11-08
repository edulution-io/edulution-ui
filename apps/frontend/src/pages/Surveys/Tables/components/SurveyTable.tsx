import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID } from '@libs/common/constants/pageElementIds';
import SURVEYS_PAGE_TABLE_HEADER_ID from '@libs/survey/constants/pageElementIds';
import useElementHeight from '@/hooks/useElementHeight';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const SurveyTable = <TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const { selectedRows, setSelectedRows } = useSurveyTablesPageStore();

  const { t } = useTranslation();
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  const table = useReactTable({
    data,
    columns,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: handleRowSelectionChange,
    state: {
      sorting,
      rowSelection: selectedRows,
    },
  });

  const { getHeaderGroups, getRowModel } = table;

  const pageBarsHeight = useElementHeight([SURVEYS_PAGE_TABLE_HEADER_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID]) - 10;

  return (
    <div
      className="m-4 w-full flex-1 overflow-auto pl-3 pr-3.5 scrollbar-thin"
      style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
    >
      <Table>
        <TableHeader>
          {getHeaderGroups().map((headerGroup) => (
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
          {getRowModel().rows.length ? (
            getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? 'selected' : undefined}
                className="h-[40px] cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="h-8 text-background"
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
                className="h-16 text-center text-background"
              >
                {t('table.noDataAvailable')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SurveyTable;
