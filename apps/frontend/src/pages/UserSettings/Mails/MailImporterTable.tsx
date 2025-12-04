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

import React, { useMemo } from 'react';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import useMailsStore from '@/pages/Mail/useMailsStore';
import { SyncJobDto } from '@libs/mail/types';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import MAIL_IMPORTER_TABLE_COLUMNS from '@libs/mail/constants/mailImporterTableColumns';
import useMedia from '@/hooks/useMedia';
import MailImporterTableColumns from './MailImporterTableColumns';

const MailImporterTable: React.FC = () => {
  const { isMobileView, isTabletView } = useMedia();
  const { syncJobs, selectedSyncJob, setSelectedSyncJob } = useMailsStore();
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedSyncJob) : updaterOrValue;
    setSelectedSyncJob(newValue);
  };

  const initialColumnVisibility = useMemo(
    () => ({
      [MAIL_IMPORTER_TABLE_COLUMNS.HOSTNAME]: !isMobileView,
      [MAIL_IMPORTER_TABLE_COLUMNS.PORT]: !(isMobileView || isTabletView),
      [MAIL_IMPORTER_TABLE_COLUMNS.ENCRYPTION]: !(isMobileView || isTabletView),
      [MAIL_IMPORTER_TABLE_COLUMNS.SYNC_INTERVAL]: !(isMobileView || isTabletView),
    }),
    [isMobileView, isTabletView],
  );

  return (
    <ScrollableTable
      columns={MailImporterTableColumns}
      data={syncJobs}
      filterKey={MAIL_IMPORTER_TABLE_COLUMNS.USERNAME}
      filterPlaceHolderText="mail.importer.filterPlaceHolderText"
      applicationName={APPS.MAIL}
      onRowSelectionChange={handleRowSelectionChange}
      selectedRows={selectedSyncJob}
      getRowId={(originalRow: SyncJobDto) => `${originalRow.id}`}
      initialColumnVisibility={initialColumnVisibility}
    />
  );
};

export default MailImporterTable;
