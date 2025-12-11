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

import React, { useEffect, useMemo } from 'react';
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import ConferencesTableColumns from '@/pages/ConferencePage/Table/ConferencesTableColumns';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import useUserStore from '@/store/UserStore/useUserStore';
import APPS from '@libs/appconfig/constants/apps';
import useMedia from '@/hooks/useMedia';
import CONFERENCES_TABLE_COLUMNS from '@libs/conferences/constants/conferencesTableColumns';

const ConferencesTable = () => {
  const { isMobileView, isTabletView } = useMedia();

  const { user } = useUserStore();
  const { conferences, getConferences, isLoading, selectedRows, setSelectedRows } = useConferenceStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  useEffect(() => {
    void getConferences();
  }, []);

  const initialColumnVisibility = useMemo(
    () => ({
      [CONFERENCES_TABLE_COLUMNS.CONFERENCE_CREATOR]: !isMobileView,
      [CONFERENCES_TABLE_COLUMNS.CONFERENCE_PASSWORD]: !(isMobileView || isTabletView),
      [CONFERENCES_TABLE_COLUMNS.CONFERENCE_INVITED_ATTENDEES]: !(isMobileView || isTabletView),
      [CONFERENCES_TABLE_COLUMNS.CONFERENCE_JOINED_ATTENDEES]: !isMobileView,
      [CONFERENCES_TABLE_COLUMNS.CONFERENCE_ACTION_BUTTON]: !isMobileView,
    }),
    [isMobileView, isTabletView],
  );

  return (
    <ScrollableTable
      columns={ConferencesTableColumns}
      data={conferences}
      filterKey={CONFERENCES_TABLE_COLUMNS.CONFERENCE_NAME}
      filterPlaceHolderText="conferences.filterPlaceHolderText"
      onRowSelectionChange={handleRowSelectionChange}
      isLoading={isLoading}
      selectedRows={selectedRows}
      getRowId={(originalRow) => originalRow.meetingID}
      applicationName={APPS.CONFERENCES}
      enableRowSelection={(row) => row.original.creator.username === user?.username}
      initialColumnVisibility={initialColumnVisibility}
    />
  );
};

export default ConferencesTable;
