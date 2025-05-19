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

import React, { useMemo } from 'react';
import { IconContext } from 'react-icons';
import { FaGear } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import { Row } from '@tanstack/react-table';
import cn from '@libs/common/utils/className';
import DropdownMenuItemType from '@libs/ui/types/dropdownMenuItemType';
import DropdownMenu from '@/components/shared/DropdownMenu';
import { Button } from '@/components/shared/Button';
import TableAction from '../../../../../../libs/src/common/types/TableAction';

interface TableActionMenuProps<TData, TValue> {
  actions: TableAction<TData, TValue>[];
  row?: Row<TData>;
}

const TableActionMenu = <TData, TValue>({ actions, row }: TableActionMenuProps<TData, TValue>) => {
  const { t } = useTranslation();

  const iconContextValue = useMemo(() => ({ className: 'h-4 w-4' }), []);

  const contextMenuItems: DropdownMenuItemType[] = actions.map((action) => ({
    icon: action.icon,
    label: t(`${action.translationId}`),
    onClick: () => action.onClick(row),
  }));

  return (
    <div key="actionMenu">
      <DropdownMenu
        menuContentClassName="z-[600]"
        trigger={
          <div className="relative">
            <Button
              type="button"
              variant="btn-outline"
              className={cn('m-0 max-h-[2.25rem] w-[80px] rounded-md bg-opacity-90')}
            >
              <IconContext.Provider value={iconContextValue}>
                <FaGear className="h-[18px] w-[18px]" />
              </IconContext.Provider>
            </Button>
          </div>
        }
        items={contextMenuItems}
      />
    </div>
  );
};

export default TableActionMenu;
