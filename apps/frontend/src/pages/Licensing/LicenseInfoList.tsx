import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useLicenseInfoStore from '@/pages/Licensing/LicenseInfoStore';
import LicenseInfoTableColumns from '@/pages/Licensing/table/LicenseInfoTableColumns';

const LicenseInfoList = () => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const { t } = useTranslation();

  const { selectedRows, setSelectedRows, licenses, showOnlyActiveLicenses, getLicenses, isLoading } =
    useLicenseInfoStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  const filteredLicenses = useMemo(
    (): LicenseInfoDto[] => (showOnlyActiveLicenses ? licenses.filter((a) => a.isLicenseActive) : licenses),
    [licenses, showOnlyActiveLicenses],
  );

  const table = useReactTable({
    data: filteredLicenses,
    columns: LicenseInfoTableColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: handleRowSelectionChange,
    getRowId: (originalRow: LicenseInfoDto) =>
      originalRow.id && typeof originalRow.id !== 'string' ? `${originalRow.id.toHexString()}` : originalRow.id,
    state: {
      sorting,
      rowSelection: selectedRows,
    },
  });

  useEffect(() => {
    const fetchLicenses = async () => getLicenses(false);

    fetchLicenses().catch((e) => console.error(e));
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const intervalId = setInterval(fetchLicenses, 500000); // TODO: 10000

    return () => {
      clearInterval(intervalId);
      setSelectedRows({});
    };
  }, [getLicenses, setSelectedRows]);

  return (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}

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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    onClick={() => row.toggleSelected()}
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
                    colSpan={licenses.length}
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

export default LicenseInfoList;
