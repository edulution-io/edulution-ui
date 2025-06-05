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
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { Row } from '@tanstack/react-table';
import TableAction from '@libs/common/types/tableAction';
import TableActionMenu from './TableActionMenu';

interface TableActionCellProps<TData> {
  actions: TableAction<TData>[];
  row: Row<TData>;
}

const TableActionCell = <TData,>(props: TableActionCellProps<TData>) => {
  const { actions = [], row } = props;

  if (actions.length < 1) {
    return null;
  }

  if (actions.length === 1) {
    const singleAction = actions[0];
    const { icon: Icon, onClick } = singleAction;
    return (
      <button
        type="button"
        className="m-0 flex w-full items-center justify-center p-0"
        onClick={() => onClick(row)}
      >
        <Icon className="m-0 h-5 w-5 p-0" />
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <TableActionMenu
        actions={actions}
        row={row}
        trigger={
          <div className="relative flex w-full items-center justify-end">
            <button
              type="button"
              className="flex w-full justify-center"
            >
              <HiOutlineDotsHorizontal className="h-5 w-5" />
            </button>
          </div>
        }
      />
    </div>
  );
};

export default TableActionCell;
