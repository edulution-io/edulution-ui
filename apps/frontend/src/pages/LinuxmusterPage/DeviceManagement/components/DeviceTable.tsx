/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type ColumnSort,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import SelectColumnsDropdown from '@/components/ui/Table/SelectColumnsDropdown';
import Input from '@/components/shared/Input';
import type DeviceRow from '@libs/deviceManagement/types/deviceRow';
import getDeviceColumns from './getDeviceColumns';

interface DeviceTableProps {
  rows: DeviceRow[];
  newRowIds: Set<string>;
  changedCells: Set<string>;
  deletedRowIds: Set<string>;
  duplicateCells: Set<string>;
  onRowsChange: (rows: DeviceRow[]) => void;
  onDeleteRow: (rowIndex: number) => void;
  onDuplicateRow: (rowIndex: number) => void;
  initialSorting?: ColumnSort[];
}

const DeviceTable: React.FC<DeviceTableProps> = ({
  rows,
  newRowIds,
  changedCells,
  deletedRowIds,
  duplicateCells,
  onRowsChange,
  onDeleteRow,
  onDuplicateRow,
  initialSorting = [],
}) => {
  const { t } = useTranslation();
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousRowCountRef = useRef(0);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const onRowsChangeRef = useRef(onRowsChange);
  onRowsChangeRef.current = onRowsChange;

  const newRowIdsRef = useRef(newRowIds);
  newRowIdsRef.current = newRowIds;
  const changedCellsRef = useRef(changedCells);
  changedCellsRef.current = changedCells;
  const deletedRowIdsRef = useRef(deletedRowIds);
  deletedRowIdsRef.current = deletedRowIds;
  const duplicateCellsRef = useRef(duplicateCells);
  duplicateCellsRef.current = duplicateCells;
  const onDeleteRowRef = useRef(onDeleteRow);
  onDeleteRowRef.current = onDeleteRow;
  const onDuplicateRowRef = useRef(onDuplicateRow);
  onDuplicateRowRef.current = onDuplicateRow;

  const isNewRow = useCallback((rowId: string) => newRowIdsRef.current.has(rowId), []);
  const isCellChanged = useCallback(
    (rowId: string, columnKey: string) => changedCellsRef.current.has(`${rowId}-${columnKey}`),
    [],
  );
  const isDuplicate = useCallback(
    (rowId: string, columnKey: string) => duplicateCellsRef.current.has(`${rowId}-${columnKey}`),
    [],
  );

  useEffect(() => {
    const previousCount = previousRowCountRef.current;
    previousRowCountRef.current = rows.length;

    if (previousCount > 0 && rows.length > previousCount && scrollContainerRef.current) {
      setSorting([]);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollContainerRef.current?.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        });
      });
    }
  }, [rows.length]);

  const updateCell = useCallback((rowIndex: number, columnKey: string, value: string) => {
    const newRows = [...rowsRef.current];
    newRows[rowIndex] = { ...newRows[rowIndex], [columnKey]: value };
    onRowsChangeRef.current(newRows);
  }, []);

  const trimCell = useCallback((rowIndex: number, columnKey: string) => {
    const currentValue = (rowsRef.current[rowIndex] as unknown as Record<string, string>)[columnKey] ?? '';
    const trimmed = currentValue.trim();
    if (trimmed !== currentValue) {
      const newRows = [...rowsRef.current];
      newRows[rowIndex] = { ...newRows[rowIndex], [columnKey]: trimmed };
      onRowsChangeRef.current(newRows);
    }
  }, []);

  const deleteRow = useCallback((rowIndex: number) => {
    onDeleteRowRef.current(rowIndex);
  }, []);

  const duplicateRow = useCallback((rowIndex: number) => {
    onDuplicateRowRef.current(rowIndex);
  }, []);

  const columns = useMemo(
    () =>
      getDeviceColumns({
        isNewRow,
        isCellChanged,
        isDuplicate,
        onCellChange: updateCell,
        onCellBlur: trimCell,
        onDeleteRow: deleteRow,
        onDuplicateRow: duplicateRow,
      }),
    [isNewRow, isCellChanged, isDuplicate, updateCell, trimCell, deleteRow, duplicateRow],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      sorting,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: (row) => row.id,
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 pb-4">
        <div className="min-w-0 flex-1">
          <Input
            placeholder={t('common.filter')}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <SelectColumnsDropdown table={table} />
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto scrollbar-thin"
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : undefined }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                if (deletedRowIds.has(row.id)) return null;
                return (
                  <TableRow
                    key={row.id}
                    className="[&:focus-within_input]:bg-white dark:[&:focus-within_input]:bg-accent"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                );
              })
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
      </div>
    </div>
  );
};

export default DeviceTable;
