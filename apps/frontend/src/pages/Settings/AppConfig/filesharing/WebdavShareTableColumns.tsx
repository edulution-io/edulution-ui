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
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import WEBDAV_SHARE_TABLE_COLUMNS from '@libs/filesharing/constants/webdavShareTableColumns';
import TableActionCell from '@/components/ui/Table/TableActionCell';
import { MdDelete, MdEdit } from 'react-icons/md';
import ID_ACTION_TABLE_COLUMN from '@libs/common/constants/idActionTableColumn';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';
import useAppConfigTableDialogStore from '../components/table/useAppConfigTableDialogStore';
import useWebdavShareConfigTableStore from './useWebdavShareConfigTableStore';
import useWebdavServerConfigTableStore from './useWebdavServerConfigTableStore';

const WebdavShareTableColumns: ColumnDef<WebdavShareDto>[] = [
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
    id: WEBDAV_SHARE_TABLE_COLUMNS.ROOT_SERVER,
    header: ({ column }) => <SortableHeader<WebdavShareDto, unknown> column={column} />,

    meta: {
      translationId: 'server',
    },
    accessorFn: (row) => row.rootServer,
    cell: ({ row }) => {
      const { tableContentData } = useWebdavServerConfigTableStore();

      return (
        <SelectableTextCell
          text={
            tableContentData.find((server) => server.webdavShareId === row.original.rootServer)?.displayName ||
            row.original.rootServer
          }
          onClick={() => row.toggleSelected()}
        />
      );
    },
  },
  {
    id: WEBDAV_SHARE_TABLE_COLUMNS.PATHNAME,
    header: ({ column }) => <SortableHeader<WebdavShareDto, unknown> column={column} />,

    meta: {
      translationId: 'form.pathname',
    },
    accessorFn: (row) => row.pathname,
    cell: ({ row }) => (
      <SelectableTextCell
        text={row.original.pathname}
        onClick={() => row.toggleSelected()}
      />
    ),
  },

  {
    id: WEBDAV_SHARE_TABLE_COLUMNS.PATH_VARIABLES,
    header: ({ column }) => {
      const { isLmn } = useDeploymentTarget();
      if (!isLmn) return null;
      return <SortableHeader<WebdavShareDto, unknown> column={column} />;
    },

    meta: {
      translationId: 'webdavShare.pathVariables.title',
    },
    accessorFn: (row) => row.pathVariables,
    cell: ({ row }) => {
      const { isLmn } = useDeploymentTarget();
      if (!isLmn) return null;

      return (
        <SelectableTextCell
          text={
            row.original.pathVariables.length > 0
              ? row.original.pathVariables.map((variable) => variable.value).join(', ')
              : '-'
          }
          onClick={() => row.toggleSelected()}
        />
      );
    },
  },
  {
    id: WEBDAV_SHARE_TABLE_COLUMNS.ACCESSGROUPS,
    header: ({ column }) => <SortableHeader<WebdavShareDto, unknown> column={column} />,

    meta: {
      translationId: 'permission.groups',
    },
    accessorFn: (row) => row.accessGroups,
    cell: ({ row }) => (
      <SelectableTextCell
        text={
          row.original.accessGroups.length > 0 ? row.original.accessGroups.map((group) => group.name).join(', ') : '-'
        }
        onClick={() => row.toggleSelected()}
        className="max-w-60 overflow-hidden text-ellipsis whitespace-nowrap"
      />
    ),
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

export default WebdavShareTableColumns;
