/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
