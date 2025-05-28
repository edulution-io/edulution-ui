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
import { useTranslation } from 'react-i18next';
import { Row } from '@tanstack/react-table';
import TableAction from '@libs/common/types/tableAction';
import DropdownMenuItemType from '@libs/ui/types/dropdownMenuItemType';
import DropdownMenu from '@/components/shared/DropdownMenu';

interface TableActionMenuProps<TData> {
  actions: TableAction<TData>[];
  row?: Row<TData>;
  trigger?: React.ReactNode;
}

const TableActionMenu = <TData,>({ actions, row, trigger }: TableActionMenuProps<TData>) => {
  const { t } = useTranslation();

  const contextMenuItems: DropdownMenuItemType[] = actions.map((action) => ({
    icon: action.icon,
    label: t(`${action.translationId}`),
    onClick: () => action.onClick(row),
  }));

  return (
    <DropdownMenu
      menuContentClassName="z-[600]"
      trigger={trigger}
      items={contextMenuItems}
    />
  );
};

export default TableActionMenu;
