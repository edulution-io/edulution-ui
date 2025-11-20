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
import { useLocation } from 'react-router-dom';
import { MdFileCopy } from 'react-icons/md';
import i18n from '@/i18n';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import FileInfoDto from '@libs/appconfig/types/fileInfo.dto';
import { formatBytes, getElapsedTime } from '@/pages/FileSharing/utilities/filesharingUtilities';
import FileIconComponent from '@/pages/FileSharing/utilities/FileIconComponent';
import { TABLE_ICON_SIZE } from '@libs/ui/constants';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import copyToClipboard from '@/utils/copyToClipboard';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import { TooltipProvider } from '@/components/ui/Tooltip';
import ActionTooltip from '@/components/shared/ActionTooltip';
import { FcFolder } from 'react-icons/fc';

const renderFileIcon = (item: FileInfoDto) => {
  if (item.type !== 'directory') {
    return (
      <FileIconComponent
        filename={item.filename}
        size={Number(TABLE_ICON_SIZE)}
      />
    );
  }
  return <FcFolder size={TABLE_ICON_SIZE} />;
};

const FileTableColumns: ColumnDef<FileInfoDto>[] = [
  {
    id: 'id',
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
    id: 'filename',
    header: ({ column }) => <SortableHeader<FileInfoDto, unknown> column={column} />,

    meta: {
      translationId: 'fileSharingTable.filename',
    },

    accessorFn: (row) => row.filename,
    cell: ({ row }) => (
      <SelectableTextCell
        icon={renderFileIcon(row.original)}
        text={row.original.filename}
        onClick={() => row.toggleSelected()}
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
          onClick={() => row.toggleSelected()}
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
        onClick={() => row.toggleSelected()}
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
          onClick={() => row.toggleSelected()}
        />
      );
    },
  },
  {
    accessorKey: 'copyToClipboard',
    header: () => <div className="hidden" />,
    meta: {
      translationId: 'common.copy.url',
    },
    cell: ({ row }) => {
      const { pathname } = useLocation();
      const appName = pathname.split('/')[2];
      const fileUrl = `${EDU_API_URL}/${EDU_API_CONFIG_ENDPOINTS.FILES}/file/${appName}/${row.original.filename}`;
      const toasterTranslationIds = {
        success: 'common.copy.success',
        error: 'common.copy.error',
      };
      return (
        <TooltipProvider>
          <ActionTooltip
            tooltipText={i18n.t('common.copy.url')}
            trigger={
              <SelectableTextCell
                text={<MdFileCopy size={TABLE_ICON_SIZE} />}
                onClick={() => copyToClipboard(fileUrl, toasterTranslationIds)}
              />
            }
          />
        </TooltipProvider>
      );
    },
  },
];

export default FileTableColumns;
