import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import Input from '@/components/shared/Input';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent as Content,
  DropdownMenuSH as DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenuSH';

import { Button } from '@/components/shared/Button';
import { ChevronDown } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey: string;
  filterPlaceHolderText: string;
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
  usedInAppConfig?: boolean;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean) | undefined;
}

const ScrollableTable = <TData, TValue>({
  columns,
  data,
  filterKey,
  filterPlaceHolderText,
  onRowSelectionChange,
  isLoading,
  selectedRows = {},
  getRowId,
  applicationName,
  additionalScrollContainerOffset = 0,
  scrollContainerOffsetElementIds = {},
  enableRowSelection,
  usedInAppConfig = false,
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
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: getRowId || ((originalRow: TData) => (originalRow as { id: string }).id),
    onRowSelectionChange,
    enableRowSelection,
    state: {
      rowSelection: selectedRows,
    },
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const filterValue = String(table.getColumn(filterKey)?.getFilterValue() || '');

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
        <>
          {!usedInAppConfig && <div className="flex-1 text-sm text-muted-foreground text-white">&nbsp;</div>}
          <p />
        </>
      )}

      <div
        className={`w-full flex-1 overflow-auto scrollbar-thin ${!usedInAppConfig ? 'pl-3 pr-3.5' : ''}`}
        style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      >
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder={t(filterPlaceHolderText)}
              value={filterValue}
              onChange={(event) => table.getColumn(filterKey)?.setFilterValue(event.target.value)}
              className="max-w-xl bg-ciDarkGrey text-ciLightGrey"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="btn-small"
                  className="ml-auto h-8 bg-ciDarkGrey text-ciLightGrey"
                >
                  {t('common.columns')} <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <Content align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(value)}
                    >
                      {t(column.columnDef.meta?.translationId ?? column.id)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </Content>
            </DropdownMenu>
          </div>
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
      </div>
    </>
  );
};

export default ScrollableTable;
