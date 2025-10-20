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
import TableAction from '@libs/common/types/tableAction';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { TableCell, TableFooter, TableRow } from '@/components/ui/Table';
import TableActionMenu from '@/components/ui/Table/TableActionMenu';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';

interface TableActionFooterProps<TData> {
  actions?: TableAction<TData>[];
  columnLength: number;
}

const TableActionFooter = <TData,>(props: TableActionFooterProps<TData>) => {
  const { actions = [], columnLength } = props;

  if (actions.length < 1) {
    return null;
  }

  if (actions.length < 3) {
    const actionButtons = actions.map((action) => {
      const { icon: Icon, onClick, translationId, disabled = false } = action;
      return (
        <ButtonSH
          key={translationId}
          className="flex h-2 max-h-[2.25rem] min-h-[32px] w-full items-center justify-center rounded-md border border-gray-500"
          onClick={() => onClick()}
          type="button"
          disabled={disabled}
        >
          <Icon className="h-[18px] w-[18px] text-xl text-background" />
        </ButtonSH>
      );
    });

    return (
      <TableFooter>
        <TableRow className="m-0 p-0 hover:bg-black/0">
          <TableCell
            colSpan={columnLength}
            className="m-0 p-0 hover:bg-black/0"
          >
            <div className="mx-0 my-1 flex w-full items-center justify-end gap-2 hover:bg-black/0">{actionButtons}</div>
          </TableCell>
        </TableRow>
      </TableFooter>
    );
  }

  return (
    <TableFooter>
      <TableRow className="m-0 p-0 hover:bg-black/0">
        <TableCell
          colSpan={columnLength}
          className="m-0 p-0 hover:bg-black/0"
        >
          <div className="mx-0 my-1 flex w-full items-center justify-end gap-2 hover:bg-black/0">
            <TableActionMenu
              actions={actions}
              trigger={
                <div className="relative flex w-full items-center justify-end">
                  <ButtonSH
                    className="flex h-2 max-h-[2.25rem] min-h-[32px] w-[200px] items-center justify-center rounded-md border border-gray-500"
                    type="button"
                  >
                    <HiOutlineDotsHorizontal className="h-[18px] w-[18px] text-xl text-background" />
                  </ButtonSH>
                </div>
              }
            />
          </div>
        </TableCell>
      </TableRow>
    </TableFooter>
  );
};

export default TableActionFooter;
