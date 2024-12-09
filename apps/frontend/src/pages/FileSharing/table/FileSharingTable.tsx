import React from 'react';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import FileSharingTableColumns from '@/pages/FileSharing/table/FileSharingTableColumns';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useFileSharingMenuConfig from '@/pages/FileSharing/useMenuConfig';

const FileSharingTable = () => {
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

  const { appName } = useFileSharingMenuConfig();

  return (
    <ScrollableTable
      columns={FileSharingTableColumns}
      data={files}
      filterKey="select-filename"
      filterPlaceHolderText="filesharing.filterPlaceHolderText"
      onRowSelectionChange={handleRowSelectionChange}
      isLoading={isLoading}
      selectedRows={selectedRows}
      getRowId={(row) => row.filename}
      applicationName={appName}
    />
  );
};

export default FileSharingTable;
