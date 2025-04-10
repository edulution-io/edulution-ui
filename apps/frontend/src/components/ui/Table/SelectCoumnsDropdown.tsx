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
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/shared/Button';
import DropdownMenu from '@/components/shared/DropdownMenu';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SelectColumnsDropdownProps<TData> {
  table: Table<TData>;
  isDialog?: boolean;
}

const SelectColumnsDropdown = <TData,>({ table, isDialog }: SelectColumnsDropdownProps<TData>) => {
  const { t } = useTranslation();

  const dropdownItems = table
    .getAllColumns()
    .filter((column) => column.getCanHide())
    .map((column) => ({
      label: t(column.columnDef.meta?.translationId ?? column.id),
      isCheckbox: true,
      checked: column.getIsVisible(),
      onCheckedChange: (visible: boolean) => column.toggleVisibility(visible),
    }));

  return (
    <DropdownMenu
      trigger={
        <Button
          variant="btn-small"
          className={`text-secondary ${isDialog ? 'bg-muted' : 'bg-accent'}`}
        >
          {t('common.columns')} <ChevronDown />
        </Button>
      }
      items={dropdownItems}
    />
  );
};

export default SelectColumnsDropdown;
