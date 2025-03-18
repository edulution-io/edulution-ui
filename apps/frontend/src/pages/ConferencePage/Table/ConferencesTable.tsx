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
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import ConferencesTableColumns from '@/pages/ConferencePage/Table/ConferencesTableColumns';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import CONFERENCES_PAGE_TABLE_HEADER from '@libs/conferences/constants/pageElementIds';
import useUserStore from '@/store/UserStore/UserStore';
import APPS from '@libs/appconfig/constants/apps';
import useIsMobileView from '@/hooks/useIsMobileView';
import CONFERENCES_TABLE_COLUMNS from '@libs/conferences/constants/conferencesTableColumns';

const ConferencesTable = () => {
  const isMobileView = useIsMobileView();

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
      [CONFERENCES_TABLE_COLUMNS.CONFERENCE_PASSWORD]: !isMobileView,
      [CONFERENCES_TABLE_COLUMNS.CONFERENCE_INVITED_ATTENDEES]: !isMobileView,
      [CONFERENCES_TABLE_COLUMNS.CONFERENCE_JOINED_ATTENDEES]: !isMobileView,
      [CONFERENCES_TABLE_COLUMNS.CONFERENCE_ACTION_BUTTON]: !isMobileView,
    }),
    [isMobileView],
  );

  return (
    <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
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
        additionalScrollContainerOffset={20}
        enableRowSelection={(row) => row.original.creator.username === user?.username}
        scrollContainerOffsetElementIds={{
          tableHeaderId: CONFERENCES_PAGE_TABLE_HEADER,
          others: [NATIVE_APP_HEADER_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID],
        }}
        initialColumnVisibility={initialColumnVisibility}
      />
    </div>
  );
};

export default ConferencesTable;
