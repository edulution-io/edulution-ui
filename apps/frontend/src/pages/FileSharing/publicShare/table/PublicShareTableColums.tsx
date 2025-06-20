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

import { ColumnDef } from '@tanstack/react-table';
import PUBLIC_SHARED_FILES_TABLE_COLUMN from '@libs/filesharing/constants/publicSharedFIlesTableColum';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import React from 'react';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import PublicFileShareDto from '@libs/filesharing/types/publicFileShareDto';
import formatIsoDate from '@libs/common/utils/Date/formatIsoDate';
import { LockClosedIcon } from '@radix-ui/react-icons';
import { BUTTONS_ICON_WIDTH } from '@libs/ui/constants';
import { useTranslation } from 'react-i18next';
import { Globe, QrCodeIcon } from 'lucide-react';
import InputWithActionIcons from '@/components/shared/InputWithActionIcons';
import copyToClipboard from '@/utils/copyToClipboard';
import { MdDelete, MdEdit, MdFileCopy } from 'react-icons/md';
import { usePublicShareStore } from '@/pages/FileSharing/publicShare/usePublicShareStore';
import TableActionCell from '@/components/ui/Table/TableActionCell';

const PublicShareFilesTableColumns: ColumnDef<PublicFileShareDto>[] = [
  {
    id: PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_NAME,
    header: ({ table, column }) => (
      <SortableHeader<PublicFileShareDto, unknown>
        className="min-w-32"
        table={table}
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.fileName',
    },
    accessorFn: (row) => row.filename,
    cell: ({ row }) => {
      const { filename } = row.original;
      return (
        <SelectableTextCell
          onClick={() => {}}
          text={filename}
          row={row}
          className="min-w-32"
          isFirstColumn
        />
      );
    },
  },
  {
    accessorKey: PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_CREATED_AT,
    header: ({ column }) => (
      <SortableHeader<PublicFileShareDto, unknown>
        className="min-w-32"
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.createdAt',
    },
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => {
      const { createdAt } = row.original;
      return (
        <SelectableTextCell
          text={formatIsoDate(createdAt?.toLocaleString())}
          className="min-w-32"
        />
      );
    },
  },
  {
    accessorKey: PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_VALID_UNTIL,
    header: ({ column }) => (
      <SortableHeader<PublicFileShareDto, unknown>
        className="min-w-32"
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.validUntil',
    },
    accessorFn: (row) => row.expires,
    cell: ({ row }) => {
      const { expires } = row.original;
      const validUntil = new Date(expires)?.toLocaleString('de-DE', {
        timeZone: 'Europe/Berlin',
        dateStyle: 'short',
        timeStyle: 'short',
      });
      return (
        <SelectableTextCell
          text={validUntil}
          className="min-w-32"
        />
      );
    },
  },
  {
    accessorKey: PUBLIC_SHARED_FILES_TABLE_COLUMN.IS_PASSWORD_PROTECTED,
    header: ({ column }) => (
      <SortableHeader<PublicFileShareDto, unknown>
        className="min-w-32"
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.isPasswordProtected',
    },
    accessorFn: (row) => row.password,
    cell: ({ row }) => {
      const { password } = row.original;
      return (
        <SelectableTextCell
          className="min-w-20"
          text={'*'.repeat(password?.length || 0)}
          icon={
            password ? (
              <LockClosedIcon
                width={BUTTONS_ICON_WIDTH}
                height={BUTTONS_ICON_WIDTH}
              />
            ) : undefined
          }
        />
      );
    },
  },
  {
    id: PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_IS_ACCESSIBLE_BY,
    header: ({ column }) => <SortableHeader<PublicFileShareDto, unknown> column={column} />,
    meta: {
      translationId: 'filesharing.publicFileSharing.isAccessibleBy',
    },
    accessorFn: (row) => row.invitedGroups.length,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const { invitedAttendees = [], invitedGroups = [] } = row.original;

      const attendeeCount = invitedAttendees.length;
      const groupsCount = invitedGroups.length;

      if (attendeeCount === 0 && groupsCount === 0) {
        return (
          <SelectableTextCell
            icon={<Globe size={BUTTONS_ICON_WIDTH} />}
            text={t('filesharing.publicFileSharing.publiclyAccessible')}
            onClick={() => {}}
          />
        );
      }

      const attendeeText = `${attendeeCount} ${t(
        attendeeCount === 1 ? 'conferences.attendee' : 'conferences.attendees',
      )}`;

      const groupsText =
        groupsCount > 0 ? `, ${groupsCount} ${t(groupsCount === 1 ? 'common.group' : 'common.groups')}` : '';

      return (
        <SelectableTextCell
          text={`${attendeeText}${groupsText}`}
          onClick={() => {}}
        />
      );
    },
  },
  {
    accessorKey: PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_LINK,
    header: ({ column }) => (
      <SortableHeader<PublicFileShareDto, unknown>
        className="min-w-32"
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.fileLink',
    },
    accessorFn: (row) => row.fileLink,
    cell: ({ row }) => {
      const { origin } = window.location;
      const { setPublicShareContent, setIsPublicShareQrCodeDialogOpen } = usePublicShareStore();
      const { publicFileLink } = row.original;
      const url = `${origin}/${publicFileLink}`;
      return (
        <div className="flex w-full min-w-0 items-center gap-2">
          <InputWithActionIcons
            type="text"
            value={url}
            readOnly
            className="min-w-0 flex-1 cursor-pointer truncate"
            onMouseDown={(e) => {
              e.preventDefault();
              copyToClipboard(url);
            }}
          />
          <MdFileCopy
            size={BUTTONS_ICON_WIDTH}
            className=" flex-none cursor-pointer"
            onClick={() => copyToClipboard(url)}
          />
          <QrCodeIcon
            size={BUTTONS_ICON_WIDTH}
            className=" flex-none cursor-pointer"
            onClick={() => {
              setPublicShareContent(row.original);
              setIsPublicShareQrCodeDialogOpen(true);
            }}
          />
        </div>
      );
    },
  },
  {
    accessorKey: PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_ACTIONS,
    header: ({ column }) => (
      <SortableHeader<PublicFileShareDto, unknown>
        className="min-w-20"
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.actions',
    },
    cell: ({ row }) => {
      const { setEditContent, setIsPublicShareEditDialogOpen, deletePublicShares } = usePublicShareStore();
      const { original } = row;

      return (
        <TableActionCell
          actions={[
            {
              icon: MdEdit,
              translationId: 'common.edit',
              onClick: () => {
                setEditContent(original);
                setIsPublicShareEditDialogOpen(true);
              },
            },
            {
              icon: MdDelete,
              translationId: 'common.delete',
              onClick: async () => {
                await deletePublicShares([original]);
              },
            },
          ]}
          row={row}
        />
      );
    },
  },
];

export default PublicShareFilesTableColumns;
