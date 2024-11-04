import React, { useEffect, useState } from 'react';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import { OnChangeFn, RowSelectionState, SortingState } from '@tanstack/react-table';
import ConferencesTableColumns from '@/pages/ConferencePage/Table/ConferencesTableColumns';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import useConferencesPageMenu from '@/pages/ConferencePage/useConferencesPageMenu';

const ConferencesTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
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
    />
  );
};

export default ConferencesTable;
