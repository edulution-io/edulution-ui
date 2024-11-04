import React, { useEffect, useState } from 'react';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import { OnChangeFn, RowSelectionState, SortingState } from '@tanstack/react-table';
import ConferencesTableColumns from '@/pages/ConferencePage/Table/ConferencesTableColumns';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';

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
    />
  );
};

export default ConferencesTable;
