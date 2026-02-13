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

import React, { useCallback, useMemo } from 'react';
import { ColumnDef, OnChangeFn, Row, RowSelectionState, VisibilityState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import TableAction from '@libs/common/types/tableAction';
import VIEW_MODE from '@libs/common/constants/viewMode';
import pinRowToTop from '@libs/ui/utils/pinRowToTop';
import type FilterOption from '@libs/ui/types/filterOption';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import Input from '@/components/shared/Input';
import TableActionFooter from '@/components/ui/Table/TableActionFooter';
import useTableViewSettingsStore from '@/store/useTableViewSettingsStore';
import Checkbox from '@/components/ui/Checkbox';
import ScrollableTable from './ScrollableTable';
import ViewModeToggle from './ViewModeToggle';
import SortDropdown from './SortDropdown';
import GridView, { GridItemConfig } from './GridView/GridView';
import useScrollableTable from './useScrollableTable';
import SelectedRowsCount from './SelectedRowsCount';
import TableFilterDropdown from './TableFilterDropdown';

interface TableGridViewProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey: string;
  filterPlaceHolderText: string;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  selectedRows?: RowSelectionState;
  isLoading?: boolean;
  getRowId?: (originalRow: TData) => string;
  applicationName: string;
  initialSorting?: { id: string; desc: boolean }[];
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean) | undefined;
  initialColumnVisibility?: VisibilityState;
  showHeader?: boolean;
  showSelectedCount?: boolean;
  isDialog?: boolean;
  actions?: TableAction<TData>[];
  showSearchBar?: boolean;
  getRowDisabled?: (row: Row<TData>) => boolean;
  getRowExcludedFromCount?: (row: Row<TData>) => boolean;
  enableDragAndDrop?: boolean;
  canDropOnRow?: (row: TData) => boolean;
  gridItemConfig: GridItemConfig<TData>;
  viewModeStorageKey: string;
  filterOptions?: FilterOption[];
  activeFilterCount?: number;
  onResetFilters?: () => void;
  focusedRowId?: string | null;
  onGridItemClick?: (item: TData) => void;
  onSortedRowsChange?: (sortedData: TData[]) => void;
  pinnedToTopRowId?: string;
}

const TableGridView = <TData, TValue>({
  columns,
  data,
  filterKey,
  filterPlaceHolderText,
  onRowSelectionChange,
  isLoading,
  selectedRows = {},
  getRowId,
  applicationName,
  enableRowSelection,
  initialSorting,
  showHeader = true,
  showSelectedCount = true,
  isDialog = false,
  initialColumnVisibility = {},
  actions,
  showSearchBar = true,
  getRowDisabled,
  getRowExcludedFromCount,
  enableDragAndDrop = false,
  canDropOnRow,
  gridItemConfig,
  viewModeStorageKey,
  filterOptions,
  activeFilterCount,
  onResetFilters,
  focusedRowId,
  onGridItemClick,
  onSortedRowsChange,
  pinnedToTopRowId,
}: TableGridViewProps<TData, TValue>) => {
  const { t } = useTranslation();
  const { getViewMode, setViewMode } = useTableViewSettingsStore();
  const viewMode = getViewMode(viewModeStorageKey);
  const isTableView = viewMode === VIEW_MODE.table;

  const handleViewModeChange = useCallback(
    (mode: typeof VIEW_MODE.table | typeof VIEW_MODE.grid) => {
      setViewMode(viewModeStorageKey, mode);
    },
    [setViewMode, viewModeStorageKey],
  );

  const viewModeToggle = useMemo(
    () => (
      <ViewModeToggle
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        isDialog={isDialog}
      />
    ),
    [viewMode, handleViewModeChange, isDialog],
  );

  const filterDropdown = useMemo(() => {
    if (!filterOptions?.length) return null;

    return (
      <TableFilterDropdown
        filterOptions={filterOptions}
        isDialog={isDialog}
        activeFilterCount={activeFilterCount}
        onResetFilters={onResetFilters}
      />
    );
  }, [filterOptions, isDialog, activeFilterCount, onResetFilters]);

  const { table } = useScrollableTable({
    columns,
    data,
    onRowSelectionChange,
    selectedRows,
    getRowId,
    enableRowSelection,
    initialSorting,
    initialColumnVisibility,
  });

  const { rows } = table.getRowModel();
  const sortedRows = useMemo(() => pinRowToTop(rows, pinnedToTopRowId), [rows, pinnedToTopRowId]);

  if (isTableView) {
    return (
      <ScrollableTable
        columns={columns}
        data={data}
        filterKey={filterKey}
        filterPlaceHolderText={filterPlaceHolderText}
        onRowSelectionChange={onRowSelectionChange}
        isLoading={isLoading}
        selectedRows={selectedRows}
        getRowId={getRowId}
        applicationName={applicationName}
        enableRowSelection={enableRowSelection}
        showHeader={showHeader}
        showSelectedCount={showSelectedCount}
        isDialog={isDialog}
        actions={actions}
        showSearchBarAndColumnSelect={showSearchBar}
        getRowDisabled={getRowDisabled}
        getRowExcludedFromCount={getRowExcludedFromCount}
        enableDragAndDrop={enableDragAndDrop}
        canDropOnRow={canDropOnRow}
        searchBarAdditionalComponent={
          <>
            {filterDropdown}
            {viewModeToggle}
          </>
        }
        activeFilterCount={activeFilterCount}
        focusedRowId={focusedRowId}
        onRowClick={onGridItemClick}
        onSortedRowsChange={onSortedRowsChange}
        externalTable={table}
        externalSortedRows={sortedRows}
      />
    );
  }

  const filteredRows = table.getFilteredRowModel().rows;
  const countableRows = getRowExcludedFromCount
    ? filteredRows.filter((row) => !getRowExcludedFromCount(row))
    : filteredRows;
  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredRowCount = countableRows.length;
  const filterValue = String(table.getColumn(filterKey)?.getFilterValue() || '');

  return (
    <>
      {isLoading && data?.length === 0 && <LoadingIndicatorDialog isOpen={isLoading} />}

      {showSelectedCount && (
        <SelectedRowsCount
          applicationName={applicationName}
          selectedRowsCount={selectedRowsCount}
          filteredRowCount={filteredRowCount}
        />
      )}

      <div className="h-full w-full flex-1 overflow-auto pr-1 scrollbar-thin">
        {(!!data.length || !!activeFilterCount) && showSearchBar && (
          <div className="flex items-center gap-2 pb-4 pt-2">
            <div className="min-w-0 flex-1">
              <Input
                placeholder={t(filterPlaceHolderText)}
                value={filterValue}
                onChange={(e) => table.getColumn(filterKey)?.setFilterValue(e.target.value)}
                variant={isDialog ? 'dialog' : 'default'}
              />
            </div>

            <SortDropdown
              table={table}
              isDialog={isDialog}
            />

            {filterDropdown}

            {viewModeToggle}
          </div>
        )}

        {showHeader && enableRowSelection !== false && (
          <div className="mb-4">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
              onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(value)}
              label={t('common.selectAll')}
            />
          </div>
        )}

        <GridView
          rows={sortedRows}
          gridItemConfig={gridItemConfig}
          enableRowSelection={enableRowSelection}
          getRowDisabled={getRowDisabled}
          enableDragAndDrop={enableDragAndDrop}
          canDropOnRow={canDropOnRow}
          focusedRowId={focusedRowId}
          onItemClick={onGridItemClick}
          onRowsChange={onSortedRowsChange}
        />
        <TableActionFooter
          actions={actions}
          columnLength={1}
        />
      </div>
    </>
  );
};

export default TableGridView;
