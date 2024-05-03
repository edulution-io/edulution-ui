import React from 'react';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { ArrowUpDown } from 'lucide-react';
import { Column, Table } from '@tanstack/react-table';
import { translateKey } from '@/utils/common';
import Checkbox from '@/components/ui/Checkbox';

interface SortableHeaderProps<TData, TValue> {
  titleTranslationId: string;
  table?: Table<TData>;
  column: Column<TData, TValue>;
}

const SortableHeader = <TData, TValue>({ titleTranslationId, table, column }: SortableHeaderProps<TData, TValue>) => (
  <div className="flex items-center">
    {table ? (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ) : null}
    <ButtonSH onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      <div className="flex items-center">
        {translateKey(titleTranslationId)}
        {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
      </div>
    </ButtonSH>
  </div>
);

export default SortableHeader;
