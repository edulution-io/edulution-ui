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
