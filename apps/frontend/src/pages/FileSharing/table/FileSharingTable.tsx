import React, { useState } from 'react';
import { OnChangeFn, RowSelectionState, SortingState } from '@tanstack/react-table';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import FileSharingTableColumns from '@/pages/FileSharing/table/FileSharingTableColumns';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';

const FileSharingTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { setSelectedRows, setSelectedItems, selectedRows, files, isLoading } = useFileSharingStore();
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(useFileSharingStore.getState().selectedRows)
        : updaterOrValue;
    setSelectedRows(newValue);
    const selectedItemData = Object.keys(newValue)
      .filter((key) => newValue[key])
      .map((rowId) => files.find((file) => file.filename === rowId))
      .filter(Boolean) as DirectoryFileDTO[];
    setSelectedItems(selectedItemData);
  };

  return (
    <ScrollableTable
      columns={FileSharingTableColumns}
      data={files}
      onRowSelectionChange={handleRowSelectionChange}
      isLoading={isLoading}
      sorting={sorting}
      setSorting={setSorting}
      selectedRows={selectedRows}
      getRowId={(row) => row.filename}
    />
  );
};

export default FileSharingTable;
