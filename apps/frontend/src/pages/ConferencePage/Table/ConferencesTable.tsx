import React, { useEffect, useState } from 'react';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import { OnChangeFn, RowSelectionState, SortingState } from '@tanstack/react-table';
import ConferencesTableColumns from '@/pages/ConferencePage/Table/ConferencesTableColumns';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import useConferencesPageMenu from '@/pages/ConferencePage/useConferencesPageMenu';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import CONFERENCES_PAGE_TABLE_HEADER from '@libs/conferences/constants/pageElementIds';
import useUserStore from '@/store/UserStore/UserStore';

const ConferencesTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { user } = useUserStore();
  const { conferences, getConferences, isLoading, selectedRows, setSelectedRows } = useConferenceStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  useEffect(() => {
    void getConferences(undefined);
  }, []);

  const { appName } = useConferencesPageMenu();

  return (
    <ScrollableTable
      columns={ConferencesTableColumns}
      data={conferences}
      onRowSelectionChange={handleRowSelectionChange}
      isLoading={isLoading}
      sorting={sorting}
      setSorting={setSorting}
      selectedRows={selectedRows}
      getRowId={(originalRow) => originalRow.meetingID}
      applicationName={appName}
      additionalScrollContainerOffset={20}
      enableRowSelection={(row) => row.original.creator.username === user?.username}
      scrollContainerOffsetElementIds={{
        tableHeaderId: CONFERENCES_PAGE_TABLE_HEADER,
        others: [NATIVE_APP_HEADER_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID],
      }}
    />
  );
};

export default ConferencesTable;
