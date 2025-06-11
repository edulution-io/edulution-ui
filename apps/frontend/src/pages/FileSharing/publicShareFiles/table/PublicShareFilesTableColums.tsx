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
import { Globe } from 'lucide-react';

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
          text={formatIsoDate(createdAt.toLocaleString())}
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
    accessorFn: (row) => row.validUntil,
    cell: ({ row }) => {
      const { validUntil } = row.original;
      return (
        <SelectableTextCell
          text={formatIsoDate(validUntil.toLocaleString())}
          className="min-w-32"
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
      const { fileLink } = row.original;
      return (
        <SelectableTextCell
          text={`${origin}/${fileLink}`}
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
          className="min-w-32"
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
];

export default PublicShareFilesTableColumns;
