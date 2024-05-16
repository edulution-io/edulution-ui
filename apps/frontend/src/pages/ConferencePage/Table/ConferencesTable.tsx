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
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import Conference from '@/pages/ConferencePage/dto/conference.dto';

const ConferencesTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { t } = useTranslation();
  const { conferences, getConferences, isLoading, error, selectedRows, setSelectedRows } = useConferenceStore();

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
    getRowId: (originalRow: Conference) => originalRow.meetingID,
    state: {
      sorting,
      rowSelection: selectedRows,
    },
  });

  useEffect(() => {
    const fetchConferences = async () => getConferences(false);

    fetchConferences().catch((e) => console.error(e));
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const intervalId = setInterval(fetchConferences, 500000); // TODO: 10000

    return () => {
      clearInterval(intervalId);
      setSelectedRows({});
    };
  }, [getConferences, setSelectedRows]);

  if (error) return <div>Error: {error.message}</div>;

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
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

      <div className="w-full flex-1  pl-3 pr-3.5">
        <ScrollArea className="max-h-[80vh] overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="text-white"
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
                    colSpan={conferences.length}
                    className="h-24 text-center text-white"
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

export default ConferencesTable;
