/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React from 'react';
import TableAction from '@libs/common/types/tableAction';
import { Button } from '@/components/shared/Button';
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
        <Button
          key={translationId}
          className="flex h-2 w-full items-center justify-center"
          onClick={() => onClick()}
          type="button"
          variant="btn-outline"
          disabled={disabled}
        >
          <Icon className="h-[18px] w-[18px] text-xl text-background" />
        </Button>
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
                  <Button
                    className="flex h-2 w-full items-center justify-center"
                    type="button"
                    variant="btn-outline"
                  >
                    <HiOutlineDotsHorizontal className="h-[18px] w-[18px] text-xl text-background" />
                  </Button>
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
