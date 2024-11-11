import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import ConferencesTableColumns from '@/pages/ConferencePage/Table/ConferencesTableColumns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import useElementHeight from '@/hooks/useElementHeight';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import CONFERENCES_PAGE_TABLE_HEADER from '@libs/conferences/constants/pageElementIds';
import useUserStore from '@/store/UserStore/UserStore';

const ConferencesTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { conferences, getConferences, isLoading, selectedRows, setSelectedRows } = useConferenceStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  const table = useReactTable({
    data: conferences,
    columns: ConferencesTableColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: handleRowSelectionChange,
    getRowId: (originalRow: ConferenceDto) => originalRow.meetingID,
    enableRowSelection: (row) => row.original.creator.username === user?.username,
    state: {
      sorting,
      rowSelection: selectedRows,
    },
  });

  useEffect(() => {
    void getConferences(undefined);
  }, []);

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  const pageBarsHeight =
    useElementHeight([NATIVE_APP_HEADER_ID, CONFERENCES_PAGE_TABLE_HEADER, FLOATING_BUTTONS_BAR_ID, FOOTER_ID]) - 20;

  return (
    <>
      {isLoading && conferences?.length === 0 ? <LoadingIndicator isOpen={isLoading} /> : null}
      {selectedRowsCount > 0 ? (
        <div className="flex-1 text-sm text-muted-foreground text-white">
          {t('conferences.selected-x-rows', {
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
            className="text-white"
            id={CONFERENCES_PAGE_TABLE_HEADER}
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
                      key={cell.id}
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
                  colSpan={conferences?.length}
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

export default ConferencesTable;
