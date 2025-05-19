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
import { Row } from '@tanstack/react-table';
import TableAction from '@libs/common/types/TableAction';
import cn from '@libs/common/utils/className';
import { Button } from '@/components/shared/Button';
import TableActionMenu from './TableActionMenu';

interface TableActionCellProps<TData, TValue> {
  actions: TableAction<TData, TValue> | TableAction<TData, TValue>[];
  row: Row<TData>;
}

const TableActionCell = <TData, TValue>(props: TableActionCellProps<TData, TValue>) => {
  const { actions, row } = props;

  const iconContextValue = useMemo(() => ({ className: 'h-4 w-4' }), []);

  let singleAction: TableAction<TData, TValue> | undefined;
  if (Array.isArray(actions)) {
    if (actions.length > 1) {
      return (
        <div className="flex items-center justify-center">
          <TableActionMenu
            actions={actions}
            row={row}
          />
        </div>
      );
    }
    if (actions.length === 0) {
      return null;
    }

    const [onlyAction] = actions;
    singleAction = onlyAction;
  } else {
    singleAction = actions;
  }

  if (!singleAction) {
    return null;
  }

  const { icon: Icon, onClick, className } = singleAction;
  return (
    <Button
      type="button"
      variant="btn-outline"
      className={cn('m-0 max-h-[2.25rem] w-[80px] rounded-md bg-opacity-90 p-0', className)}
      onClick={() => onClick(row)}
    >
      <IconContext.Provider value={iconContextValue}>
        <Icon className="h-[18px] w-[18px]" />
      </IconContext.Provider>
    </Button>
  );
};

export default TableActionCell;
