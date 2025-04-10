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
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import FileInfoDto from '@libs/appconfig/types/fileInfo.dto';
import { formatBytes, getElapsedTime } from '@/pages/FileSharing/utilities/filesharingUtilities';
import FileIconComponent from '@/pages/FileSharing/utilities/FileIconComponent';
import { TABLE_ICON_SIZE } from '@libs/ui/constants';
import { MdFolder } from 'react-icons/md';

const renderFileIcon = (item: FileInfoDto) => {
  if (item.type !== 'directory') {
    return (
      <FileIconComponent
        filename={item.filename}
        size={Number(TABLE_ICON_SIZE)}
      />
    );
  }
  return <MdFolder size={TABLE_ICON_SIZE} />;
};

const FileTableColumns: ColumnDef<FileInfoDto>[] = [
  {
    id: 'filename',
    header: ({ column }) => <SortableHeader<FileInfoDto, unknown> column={column} />,

    meta: {
      translationId: 'fileSharingTable.filename',
    },

    accessorFn: (row) => row.filename,
    cell: ({ row }) => (
      <SelectableTextCell
        icon={renderFileIcon(row.original)}
        row={row}
        text={row.original.filename}
      />
    ),
  },
  {
    accessorKey: 'size',
    header: ({ column }) => <SortableHeader<FileInfoDto, unknown> column={column} />,
    meta: {
      translationId: 'fileSharingTable.size',
    },
    cell: ({ row }) => {
      let fileSize = 0;
      if (row.original.size !== undefined) {
        fileSize = row.original.size;
      }
      return (
        <SelectableTextCell
          text={formatBytes(fileSize)}
          className="cursor-auto"
        />
      );
    },
  },
  {
    id: 'type',
    header: ({ column }) => <SortableHeader<FileInfoDto, unknown> column={column} />,

    meta: {
      translationId: 'fileSharingTable.type',
    },

    accessorFn: (row) => row.type,
    cell: ({ row }) => (
      <SelectableTextCell
        text={row.original.type}
        className="cursor-auto"
      />
    ),
  },
  {
    accessorKey: 'lastModified',
    header: ({ column }) => <SortableHeader<FileInfoDto, unknown> column={column} />,
    meta: {
      translationId: 'fileSharingTable.lastModified',
    },
    accessorFn: (row) => row.lastModified,
    cell: ({ row }) => {
      const date = new Date(row.original.lastModified);
      const formattedDate = getElapsedTime(date);

      return (
        <SelectableTextCell
          text={formattedDate}
          className="cursor-auto"
        />
      );
    },
  },
];

export default FileTableColumns;
