import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Column, Table } from '@tanstack/react-table';
import Checkbox from '@/components/ui/Checkbox';
import cn from '@libs/common/utils/className';
import i18n from '@/i18n';

interface SortableHeaderProps<TData, TValue> {
  table?: Table<TData>;
  column: Column<TData, TValue>;
  className?: string;
  hidden?: boolean;
}

const SortableHeader = <TData, TValue>({ table, column, className, hidden }: SortableHeaderProps<TData, TValue>) => (
  <div className={cn('flex items-center space-x-2', className)}>
    {table ? (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(value)}
        aria-label="Select all"
      />
    ) : null}
    {!hidden ? (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <div className="flex items-center">
          {i18n.t(String(column.columnDef.meta?.translationId || column.id))}
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </div>
      </button>
    ) : null}
  </div>
);

export default SortableHeader;
