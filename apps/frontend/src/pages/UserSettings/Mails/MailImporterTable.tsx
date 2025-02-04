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
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import useMailsStore from '@/pages/Mail/useMailsStore';
import { SyncJobDto } from '@libs/mail/types';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import MailImporterTableColumns from './MailImporterTableColumns';

const MailImporterTable: React.FC = () => {
  const { syncJobs, selectedSyncJob, setSelectedSyncJob } = useMailsStore();
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedSyncJob) : updaterOrValue;
    setSelectedSyncJob(newValue);
  };

  return (
    <ScrollableTable
      columns={MailImporterTableColumns}
      data={syncJobs}
      filterKey="hostname"
      filterPlaceHolderText="mail.importer.filterPlaceHolderText"
      applicationName={APPS.MAIL}
      onRowSelectionChange={handleRowSelectionChange}
      selectedRows={selectedSyncJob}
      getRowId={(originalRow: SyncJobDto) => `${originalRow.id}`}
    />
  );
};

export default MailImporterTable;
