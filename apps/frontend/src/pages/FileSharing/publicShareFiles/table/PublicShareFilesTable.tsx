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
import React, { useEffect } from 'react';
import { usePublicShareFilesStore } from '@/pages/FileSharing/publicShareFiles/usePublicShareFilesStore';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import PublicShareFilesTableColumns from '@/pages/FileSharing/publicShareFiles/table/PublicShareFilesTableColums';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import PUBLIC_SHARED_FILES_TABLE_COLUMN from '@libs/filesharing/constants/publicSharedFIlesTableColum';
import PublicFileShareDto from '@libs/filesharing/types/publicFileShareDto';

const PublicShareFilesTable = () => {
  const {
    selectedRows,
    setSelectedRows,
    publicShareFiles,
    isLoading,
    fetchPublicShareFiles,
    setSelectedFilesToShareRows,
  } = usePublicShareFilesStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
    const selectedItemData = Object.keys(newValue)
      .filter((key) => newValue[key])
      .map((rowId) => publicShareFiles.find(({ _id: id }) => id === rowId))
      .filter(Boolean) as PublicFileShareDto[];
    setSelectedFilesToShareRows(selectedItemData);
  };

  useEffect(() => {
    void fetchPublicShareFiles();
  }, []);

  return (
    <ScrollableTable
      columns={PublicShareFilesTableColumns}
      data={publicShareFiles}
      filterKey={PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_NAME}
      filterPlaceHolderText="fileSharing.filterPlaceHolderText"
      onRowSelectionChange={handleRowSelectionChange}
      isLoading={isLoading}
      selectedRows={selectedRows}
      getRowId={({ _id: id }) => id}
      applicationName={APPS.FILE_SHARING}
    />
  );
};

export default PublicShareFilesTable;
