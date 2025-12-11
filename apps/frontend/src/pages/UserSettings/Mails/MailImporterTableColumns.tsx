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
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import { SyncJobDto } from '@libs/mail/types';
import { ColumnDef } from '@tanstack/react-table';
import { TooltipProvider } from '@/components/ui/Tooltip';
import ActionTooltip from '@/components/shared/ActionTooltip';
import i18n from '@/i18n';
import MAIL_IMPORTER_TABLE_COLUMNS from '@libs/mail/constants/mailImporterTableColumns';
import hideOnMobileClassName from '@libs/ui/constants/hideOnMobileClassName';

const MailImporterTableColumns: ColumnDef<SyncJobDto>[] = [
  {
    id: MAIL_IMPORTER_TABLE_COLUMNS.HOSTNAME,
    header: ({ table, column }) => (
      <SortableHeader<SyncJobDto, unknown>
        table={table}
        column={column}
      />
    ),
    meta: {
      translationId: 'mail.hostname',
    },
    accessorFn: (row) => row.host1,
    cell: ({ row }) => (
      <SelectableTextCell
        text={row.original.host1}
        row={row}
      />
    ),
  },
  {
    id: MAIL_IMPORTER_TABLE_COLUMNS.PORT,
    size: 60,
    header: ({ column }) => <SortableHeader<SyncJobDto, unknown> column={column} />,
    meta: {
      translationId: 'mail.port',
    },
    accessorFn: (row) => row.port1,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={`${row.original.port1}`}
      />
    ),
  },
  {
    id: MAIL_IMPORTER_TABLE_COLUMNS.ENCRYPTION,
    size: 115,
    header: ({ column }) => <SortableHeader<SyncJobDto, unknown> column={column} />,
    meta: {
      translationId: 'mail.encryption',
    },
    accessorFn: (row) => row.enc1,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={`${row.original.enc1}`}
      />
    ),
  },
  {
    id: MAIL_IMPORTER_TABLE_COLUMNS.USERNAME,
    header: ({ column }) => <SortableHeader<SyncJobDto, unknown> column={column} />,
    meta: {
      translationId: 'common.username',
    },
    accessorFn: (row) => row.user1,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={`${row.original.user1}`}
      />
    ),
  },
  {
    id: MAIL_IMPORTER_TABLE_COLUMNS.SYNC_INTERVAL,
    size: 100,
    header: ({ column }) => <SortableHeader<SyncJobDto, unknown> column={column} />,
    meta: {
      translationId: 'mail.importer.interval',
    },
    accessorFn: (row) => row.mins_interval,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => {}}
        text={`${row.original.mins_interval} min`}
      />
    ),
  },
  {
    id: MAIL_IMPORTER_TABLE_COLUMNS.IS_ACTIVE,
    size: 80,
    header: ({ column }) => (
      <SortableHeader<SyncJobDto, unknown>
        column={column}
        className={hideOnMobileClassName}
      />
    ),
    meta: {
      translationId: 'mail.importer.isActive',
    },
    accessorFn: (row) => row.is_running,
    cell: ({ row }) => {
      const isJobRunning = row.original.exit_status === 'EX_OK';
      const isJobActive = row.original.active === 1;

      return (
        <TooltipProvider>
          <ActionTooltip
            tooltipText={isJobActive ? row.original.exit_status : i18n.t('common.disabled')}
            trigger={
              <div className="flex justify-center">
                <span
                  className={`flex h-2 w-2 rounded-full ${isJobRunning && isJobActive ? 'bg-ciLightGreen' : 'bg-ciRed'}`}
                />
              </div>
            }
          />
        </TooltipProvider>
      );
    },
  },
];

export default MailImporterTableColumns;
