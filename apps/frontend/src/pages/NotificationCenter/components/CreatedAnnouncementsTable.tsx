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
