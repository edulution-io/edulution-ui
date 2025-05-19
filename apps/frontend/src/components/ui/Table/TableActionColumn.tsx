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
import { ColumnDef } from '@tanstack/react-table';
import TableAction from '@libs/common/types/TableAction';
import TableActionCell from './TableActionCell';

export const TABLE_ACTION_COLUMN_ID = 'tableActionColumn';

interface TableActionColumnProps<TData, TValue> {
  actions: TableAction<TData, TValue> | TableAction<TData, TValue>[];
  accessorFn: (originalRow: TData, index: number) => TValue;
  id?: string;
}

const TableActionColumn = <TData, TValue>(props: TableActionColumnProps<TData, TValue>): ColumnDef<TData, TValue> => {
  const { actions, accessorFn, id } = props;

  const { t } = useTranslation();

  return {
    id: id || TABLE_ACTION_COLUMN_ID,
    header: () => <div className="flex items-center justify-center">{t('common.actions')}</div>,
    meta: {
      translationId: 'common.actions',
    },

    accessorFn,
    cell: ({ row }) => (
      <TableActionCell
        actions={actions}
        row={row}
      />
    ),
    size: 100,
  };
};

export default TableActionColumn;
