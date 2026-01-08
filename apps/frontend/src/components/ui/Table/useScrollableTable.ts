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

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  OnChangeFn,
  Row,
  RowSelectionState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import DEFAULT_TABLE_SORT_PROPERTY_KEY from '@libs/common/constants/defaultTableSortProperty';

interface UseScrollableTableOptions<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  selectedRows?: RowSelectionState;
  getRowId?: (originalRow: TData) => string;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  initialSorting?: { id: string; desc: boolean }[];
  initialColumnVisibility?: VisibilityState;
}

const useScrollableTable = <TData, TValue>({
  columns,
  data,
  onRowSelectionChange,
  selectedRows = {},
  getRowId,
  enableRowSelection,
  initialSorting,
  initialColumnVisibility = {},
}: UseScrollableTableOptions<TData, TValue>) => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility);

  useEffect(() => {
    setColumnVisibility((prev) => {
      if (JSON.stringify(initialColumnVisibility) !== JSON.stringify(prev)) {
        return initialColumnVisibility;
      }
      return prev;
    });
  }, [initialColumnVisibility]);

  const defaultSorting = useMemo(
    () => (columns.some((c) => c.id === DEFAULT_TABLE_SORT_PROPERTY_KEY) ? [{ id: 'position', desc: false }] : []),
    [columns],
  );
  const [sorting, setSorting] = useState(() => (initialSorting?.length ? initialSorting : defaultSorting));

  const fallbackGetRowId = useCallback((originalRow: TData) => (originalRow as { id: string }).id, []);
  const rowIdGetter = getRowId || fallbackGetRowId;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: rowIdGetter,
    onRowSelectionChange,
    enableRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      rowSelection: selectedRows,
      sorting,
      columnVisibility,
    },
  });

  return {
    table,
    columnVisibility,
    sorting,
  };
};

export default useScrollableTable;
