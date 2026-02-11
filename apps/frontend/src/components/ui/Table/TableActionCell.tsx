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

import React, { KeyboardEvent, MouseEvent } from 'react';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Row } from '@tanstack/react-table';
import TableAction from '@libs/frontend/common/types/tableAction';
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

  const handleStopPropagation = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
  };

  if (actions.length === 1) {
    const singleAction = actions[0];
    const { icon, onClick } = singleAction;
    return (
      <button
        type="button"
        className="m-0 flex w-full items-center justify-center p-0"
        onClick={(e) => {
          handleStopPropagation(e);
          void onClick(row);
        }}
      >
        <FontAwesomeIcon
          icon={icon}
          className="m-0 h-5 w-5 p-0"
        />
      </button>
    );
  }

  return (
    <div
      className="flex items-center justify-center"
      onClick={handleStopPropagation}
      onKeyDown={handleStopPropagation}
      role="presentation"
    >
      <TableActionMenu
        actions={actions}
        row={row}
        trigger={
          <div className="relative flex w-full items-center justify-end">
            <button
              type="button"
              className="flex w-full justify-center"
            >
              <FontAwesomeIcon
                icon={faEllipsis}
                className="h-5 w-5"
              />
            </button>
          </div>
        }
      />
    </div>
  );
};

export default TableActionCell;
