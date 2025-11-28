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
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import WEBDAV_SHARE_TABLE_COLUMNS from '@libs/filesharing/constants/webdavShareTableColumns';
import TableActionCell from '@/components/ui/Table/TableActionCell';
import { DeleteIcon, EditIcon } from '@libs/common/constants/standardActionIcons';
import ID_ACTION_TABLE_COLUMN from '@libs/common/constants/idActionTableColumn';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import cn from '@libs/common/utils/className';
import WEBDAV_SHARE_STATUS from '@libs/webdav/constants/webdavShareStatus';
import useAppConfigTableDialogStore from '../components/table/useAppConfigTableDialogStore';
import useWebdavServerConfigTableStore from './useWebdavServerConfigTableStore';

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
      const { fetchTableContent, deleteTableEntry } = useWebdavServerConfigTableStore();

      return (
        <TableActionCell
          actions={[
            {
              icon: EditIcon,
              translationId: 'common.edit',
              onClick: () => {
                if (!row.getIsSelected()) {
                  row.toggleSelected();
                }
                setDialogOpen(ExtendedOptionKeys.WEBDAV_SERVER_TABLE);
              },
            },
            {
              icon: DeleteIcon,
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
