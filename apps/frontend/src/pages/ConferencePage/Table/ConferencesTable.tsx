import React, { useEffect, useState } from 'react';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import { OnChangeFn, RowSelectionState, SortingState } from '@tanstack/react-table';
import ConferencesTableColumns from '@/pages/ConferencePage/Table/ConferencesTableColumns';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import CONFERENCES_PAGE_TABLE_HEADER from '@libs/conferences/constants/pageElementIds';
import useUserStore from '@/store/UserStore/UserStore';
import APPS from '@libs/appconfig/constants/apps';

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
      applicationName={APPS.CONFERENCES}
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
