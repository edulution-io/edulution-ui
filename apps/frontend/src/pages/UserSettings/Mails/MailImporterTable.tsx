import React, { useEffect } from 'react';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import useMailsStore from '@/pages/Mail/useMailsStore';
import { SyncJobDto } from '@libs/mail/types';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import MailImporterTableColumns from './MailImporterTableColumns';

const MailImporterTable: React.FC = () => {
  const { syncJobs, selectedSyncJob, setSelectedSyncJob, getSyncJob } = useMailsStore();
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedSyncJob) : updaterOrValue;
    setSelectedSyncJob(newValue);
  };
  useEffect(() => {
    void getSyncJob();
  }, []);

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
