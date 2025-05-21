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
import { TableCell, TableFooter, TableRow } from '@/components/ui/Table';
import TableAction from '@libs/common/types/tableAction';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { IoAdd, IoRemove } from 'react-icons/io5';
import TableActionMenu from '@/components/ui/Table/TableActionMenu';
import { MdRemoveCircleOutline, MdAddCircleOutline } from 'react-icons/md';

interface TableActionFooterProps<TData, TValue> {
  actions?: TableAction<TData, TValue>[];
  columnLength: number;
}

const TableActionFooter = <TData, TValue>(props: TableActionFooterProps<TData, TValue>) => {
  const {
    actions = [
      {
        icon: IoAdd,
        translationId: 'common.add',
        // eslint-disable-next-line no-console
        onClick: () => console.log('Add'),
      },
      {
        icon: IoRemove,
        translationId: 'common.remove',
        // eslint-disable-next-line no-console
        onClick: () => console.log('REMOVE'),
      },
      {
        icon: MdAddCircleOutline,
        translationId: 'common.add',
        // eslint-disable-next-line no-console
        onClick: () => console.log('Add'),
      },
      {
        icon: MdRemoveCircleOutline,
        translationId: 'common.remove',
        // eslint-disable-next-line no-console
        onClick: () => console.log('REMOVE'),
      },
    ],
    columnLength,
  } = props;

  const actionButtons = actions.map((action) => {
    const { icon: Icon, onClick, translationId } = action;
    return (
      <ButtonSH
        key={translationId}
        className="flex h-2 w-full items-center justify-center rounded-md border border-gray-500 hover:bg-accent"
        onClick={() => onClick()}
        type="button"
      >
        <Icon className="h-[18px] w-[18px] text-xl text-background" />
      </ButtonSH>
    );
  });

  if (actions.length < 1) {
    return null;
  }

  if (actions.length < 3) {
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
            <TableActionMenu actions={actions} />
          </div>
        </TableCell>
      </TableRow>
    </TableFooter>
  );
};

export default TableActionFooter;
