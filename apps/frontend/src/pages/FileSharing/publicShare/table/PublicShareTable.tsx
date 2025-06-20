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
import { usePublicShareStore } from '@/pages/FileSharing/publicShare/usePublicShareStore';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import PublicShareFilesTableColumns from '@/pages/FileSharing/publicShare/table/PublicShareTableColums';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import PUBLIC_SHARED_FILES_TABLE_COLUMN from '@libs/filesharing/constants/publicSharedFIlesTableColum';
import PublicShareDto from '@libs/filesharing/types/publicShareDto';

const PublicShareTable = () => {
  const {
    selectedRows,
    setSelectedRows,
    publicShareContents,
    isLoading,
    fetchPublicShares,
    setSelectedPublicShareRows,
  } = usePublicShareStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
    const selectedItemData = Object.keys(newValue)
      .filter((key) => newValue[key])
      .map((rowId) => publicShareContents.find(({ publicShareId }) => publicShareId === rowId))
      .filter(Boolean) as PublicShareDto[];
    setSelectedPublicShareRows(selectedItemData);
  };

  useEffect(() => {
    void fetchPublicShares();
  }, []);

  return (
    <ScrollableTable
      columns={PublicShareFilesTableColumns}
      data={publicShareContents}
      filterKey={PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_NAME}
      filterPlaceHolderText="filesharing.publicFileSharing.searchSharedFiles"
      onRowSelectionChange={handleRowSelectionChange}
      isLoading={isLoading}
      selectedRows={selectedRows}
      getRowId={({ publicShareId }) => publicShareId}
      applicationName={APPS.FILE_SHARING}
    />
  );
};

export default PublicShareTable;
