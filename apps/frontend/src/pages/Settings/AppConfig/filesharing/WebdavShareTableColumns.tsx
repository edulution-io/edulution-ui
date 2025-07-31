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

const WebdavShareTableColumns: ColumnDef<WebdavShareDto>[] = [
  {
    id: 'url',
    header: ({ column }) => <SortableHeader<WebdavShareDto, unknown> column={column} />,

    meta: {
      translationId: 'form.url',
    },
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={row.original.url}
      />
    ),
  },
  {
    id: 'accessGroups',
    header: ({ column }) => <SortableHeader<WebdavShareDto, unknown> column={column} />,

    meta: {
      translationId: 'permission.groups',
    },
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={row.original.accessGroups[0].name || ''}
      />
    ),
  },
];

export default WebdavShareTableColumns;
