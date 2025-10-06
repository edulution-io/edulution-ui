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
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import WEBDAV_SHARE_TABLE_COLUMNS from '@libs/filesharing/constants/webdavShareTableColumns';
import TableActionCell from '@/components/ui/Table/TableActionCell';
import { MdDelete, MdEdit } from 'react-icons/md';
import ID_ACTION_TABLE_COLUMN from '@libs/common/constants/idActionTableColumn';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import cn from '@libs/common/utils/className';
import WEBDAV_SHARE_STATUS from '@libs/webdav/constants/webdavShareStatus';
import useAppConfigTableDialogStore from '../components/table/useAppConfigTableDialogStore';
import useWebdavShareConfigTableStore from './useWebdavShareConfigTableStore';

const WebdavServerTableColumns: ColumnDef<WebdavShareDto>[] = [
  {
    id: WEBDAV_SHARE_TABLE_COLUMNS.WEBDAV_SHARE_ID,
    header: () => <div className="hidden" />,
    meta: {
      translationId: 'common.select',
    },
    cell: ({ row }) => (
      <SelectableTextCell
        row={row}
        className="max-w-0"
      />
    ),
  },
  {
    id: WEBDAV_SHARE_TABLE_COLUMNS.STATUS,
    size: 60,
    header: () => null,

    meta: {
      translationId: 'webdavShare.status',
    },

    accessorFn: (row) => row.status,
    cell: ({ row }) => {
      const badgeClass = row.original.status === WEBDAV_SHARE_STATUS.UP ? 'bg-green-500' : 'bg-red-500';

      return (
        <SelectableTextCell
          onClick={() => row.toggleSelected()}
          icon={<div className={cn('h-2 w-2 rounded-full', badgeClass)} />}
        />
      );
    },
  },
  {
    id: WEBDAV_SHARE_TABLE_COLUMNS.DISPLAY_NAME,
    header: ({ column }) => <SortableHeader<WebdavShareDto, unknown> column={column} />,

    meta: {
      translationId: 'webdavShare.displayName',
    },
    accessorFn: (row) => row.displayName,
    cell: ({ row }) => (
      <SelectableTextCell
        text={row.original.displayName}
        onClick={() => row.toggleSelected()}
      />
    ),
  },
  {
    id: WEBDAV_SHARE_TABLE_COLUMNS.URL,
    header: ({ column }) => <SortableHeader<WebdavShareDto, unknown> column={column} />,

    meta: {
      translationId: 'form.url',
    },
    accessorFn: (row) => row.url,
    cell: ({ row }) => (
      <SelectableTextCell
        text={row.original.url}
        onClick={() => row.toggleSelected()}
      />
    ),
  },
  {
    id: WEBDAV_SHARE_TABLE_COLUMNS.TYPE,
    header: ({ column }) => <SortableHeader<WebdavShareDto, unknown> column={column} />,

    meta: {
      translationId: 'common.type',
    },
    accessorFn: (row) => row.type,
    cell: ({ row }) => {
      const { t } = useTranslation();
      return (
        <SelectableTextCell
          text={t(`webdavShare.type.${row.original.type}`)}
          onClick={() => row.toggleSelected()}
        />
      );
    },
  },
  {
    id: ID_ACTION_TABLE_COLUMN,
    header: ({ column }) => <SortableHeader<WebdavShareDto, unknown> column={column} />,

    meta: {
      translationId: 'common.actions',
    },
    cell: ({ row }) => {
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const { deleteTableEntry, fetchTableContent } = useWebdavShareConfigTableStore();

      return (
        <TableActionCell
          actions={[
            {
              icon: MdEdit,
              translationId: 'common.edit',
              onClick: () => {
                if (!row.getIsSelected()) {
                  row.toggleSelected();
                }
                setDialogOpen(ExtendedOptionKeys.WEBDAV_SHARE_TABLE);
              },
            },
            {
              icon: MdDelete,
              translationId: 'common.delete',
              onClick: async () => {
                if (row.original.webdavShareId && deleteTableEntry) {
                  await deleteTableEntry('', row.original.webdavShareId);
                }
                await fetchTableContent();
              },
            },
          ]}
          row={row}
        />
      );
    },
  },
];

export default WebdavServerTableColumns;
