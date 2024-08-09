import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterval } from 'usehooks-ts';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import useLdapGroups from '@/hooks/useLdapGroups';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useLicenseInfoStore from '@/pages/Licensing/Overview/useLicenseInfoStore';
import LicenseInfoTableColumns from '@/pages/Licensing/Overview/table/LicenseInfoTableColumns';

const LicenseInfoList = () => {
  const { isSuperAdmin } = useLdapGroups();
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

  // Interval fetch every 10s
  useInterval(() => {
    if (isSuperAdmin) {
      void getLicenses();
    }
  }, 30000);

  useEffect(() => {
    if (isSuperAdmin) {
      void getLicenses();
    }
  }, []);

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
              {!isSuperAdmin ? (
                <TableRow>
                  <TableCell
                    colSpan={LicenseInfoTableColumns.length}
                    className="h-24 text-center text-white"
                  >
                    {t('licensing.notAdmin')}
                  </TableCell>
                </TableRow>
              ) : null}
              {isSuperAdmin && table.getRowModel().rows.length && table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    onClick={() => row.toggleSelected()}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={LicenseInfoTableColumns.length}
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
