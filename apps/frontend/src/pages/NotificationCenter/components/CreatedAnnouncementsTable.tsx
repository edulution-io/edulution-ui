import React, { useEffect } from 'react';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import useNotificationCenterStore from '@/pages/NotificationCenter/useNotificationCenterStore';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import CreatedAnnouncementsTableColumns from './CreatedAnnouncementsTableColumns';

const CreatedAnnouncementsTable = () => {
  const { t } = useTranslation();
  const { createdAnnouncements, selectedRows, setSelectedRows, fetchCreatedAnnouncements } =
    useNotificationCenterStore();

  useEffect(() => {
    void fetchCreatedAnnouncements();
  }, []);

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  return (
    <ScrollableTable
      columns={CreatedAnnouncementsTableColumns}
      data={createdAnnouncements}
      filterKey="title"
      filterPlaceHolderText={t('notificationcenter.searchByTitle')}
      enableRowSelection
      selectedRows={selectedRows}
      onRowSelectionChange={handleRowSelectionChange}
      applicationName={APPS.NOTIFICATION_CENTER}
      getRowId={(row) => row.id}
    />
  );
};

export default CreatedAnnouncementsTable;
