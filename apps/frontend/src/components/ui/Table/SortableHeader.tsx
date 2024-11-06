import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Column, Table } from '@tanstack/react-table';
import { translateKey } from '@/utils/common';
import Checkbox from '@/components/ui/Checkbox';
import cn from '@libs/common/utils/className';

interface SortableHeaderProps<TData, TValue> {
  titleTranslationId: string;
  table?: Table<TData>;
  column: Column<TData, TValue>;
  className?: string;
}

const SortableHeader = <TData, TValue>({
  titleTranslationId,
  table,
  column,
  className,
}: SortableHeaderProps<TData, TValue>) => (
  <div className={cn('flex items-center', className)}>
    {table ? (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ) : null}
    <button
      type="button"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      <div className="flex items-center">
        {translateKey(titleTranslationId)}
        {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
      </div>
    </button>
  </div>
);

export default SortableHeader;
