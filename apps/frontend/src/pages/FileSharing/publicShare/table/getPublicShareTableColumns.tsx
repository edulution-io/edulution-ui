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

import { ColumnDef } from '@tanstack/react-table';
import PUBLIC_SHARED_FILES_TABLE_COLUMN from '@libs/filesharing/constants/publicSharedFilesTableColumn';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import React from 'react';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import PublicShareDto from '@libs/filesharing/types/publicShareDto';
import formatIsoDateToLocaleString from '@libs/common/utils/Date/formatIsoDateToLocaleString';
import { LockClosedIcon } from '@radix-ui/react-icons';
import { BUTTONS_ICON_WIDTH } from '@libs/ui/constants';
import { useTranslation } from 'react-i18next';
import { Globe, QrCodeIcon } from 'lucide-react';
import InputWithActionIcons from '@/components/shared/InputWithActionIcons';
import copyToClipboard from '@/utils/copyToClipboard';
import { MdFileCopy } from 'react-icons/md';
import { DeleteIcon, EditIcon } from '@libs/common/constants/standardActionIcons';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import TableActionCell from '@/components/ui/Table/TableActionCell';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import PUBLIC_SHARE_DIALOG_NAMES from '@libs/filesharing/constants/publicShareDialogNames';

const getPublicShareTableColumns = (isDialog?: boolean): ColumnDef<PublicShareDto>[] => [
  {
    id: PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_NAME,
    header: ({ table, column }) => (
      <SortableHeader<PublicShareDto, unknown>
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
      <SortableHeader<PublicShareDto, unknown>
        className="min-w-32"
        column={column}
      />
    ),
    size: 130,
    meta: {
      translationId: 'filesharing.publicFileSharing.createdAt',
    },
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => {
      const { createdAt } = row.original;
      return (
        <SelectableTextCell
          text={formatIsoDateToLocaleString(createdAt?.toLocaleString())}
          className="min-w-32"
        />
      );
    },
  },
  {
    accessorKey: PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_VALID_UNTIL,
    header: ({ column }) => (
      <SortableHeader<PublicShareDto, unknown>
        className="min-w-32"
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.validUntil',
    },
    size: 130,
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
      <SortableHeader<PublicShareDto, unknown>
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
    header: ({ column }) => <SortableHeader<PublicShareDto, unknown> column={column} />,
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
      <SortableHeader<PublicShareDto, unknown>
        className="min-w-32"
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.fileLink',
    },
    cell: ({ row }) => {
      const { origin } = window.location;
      const { setShare, openDialog } = usePublicShareStore();
      const { publicShareId } = row.original;
      const url = `${origin}/${FileSharingApiEndpoints.PUBLIC_SHARE}/${publicShareId}`;
      return (
        <div className="flex w-full min-w-0 items-center gap-2">
          <InputWithActionIcons
            type="text"
            value={url}
            readOnly
            variant={isDialog ? 'dialog' : 'default'}
            className="min-w-0 flex-1 cursor-pointer truncate"
            actionIcons={[
              {
                icon: MdFileCopy,
                onClick: () => copyToClipboard(url),
              },
              {
                icon: QrCodeIcon,
                onClick: () => {
                  setShare(row.original);
                  openDialog(PUBLIC_SHARE_DIALOG_NAMES.QR_CODE);
                },
              },
            ]}
          />
        </div>
      );
    },
  },
  {
    accessorKey: PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_ACTIONS,
    header: ({ column }) => (
      <SortableHeader<PublicShareDto, unknown>
        className="min-w-20"
        column={column}
      />
    ),
    meta: {
      translationId: 'filesharing.publicFileSharing.actions',
    },
    size: 100,
    cell: ({ row }) => {
      const { setShare, openDialog, setSelectedRows } = usePublicShareStore();
      const { original } = row;

      return (
        <TableActionCell
          actions={[
            {
              icon: EditIcon,
              translationId: 'common.edit',
              onClick: () => {
                setShare(original);
                openDialog(PUBLIC_SHARE_DIALOG_NAMES.EDIT);
              },
            },
            {
              icon: DeleteIcon,
              translationId: 'common.delete',
              onClick: () => {
                setSelectedRows({ [original.publicShareId]: true });
                openDialog(PUBLIC_SHARE_DIALOG_NAMES.DELETE);
              },
            },
          ]}
          row={row}
        />
      );
    },
  },
];

export default getPublicShareTableColumns;
