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
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import getPublicShareTableColumns from '@/pages/FileSharing/publicShare/table/getPublicShareTableColumns';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import PUBLIC_SHARED_FILES_TABLE_COLUMN from '@libs/filesharing/constants/publicSharedFilesTableColumn';
import useMedia from '@/hooks/useMedia';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';

const PublicShareTable = () => {
  const { shares, isLoading, fetchShares, setSelectedRows, selectedRows } = usePublicShareStore();
  const { setIsFilePreviewVisible, isFilePreviewDocked } = useFileEditorStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  useEffect(() => {
    if (isFilePreviewDocked) {
      setIsFilePreviewVisible(false);
    }

    void fetchShares();
  }, []);

  const { isMobileView, isTabletView } = useMedia();

  const initialColumnVisibility = useMemo(
    () => ({
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_VALID_UNTIL]: !isMobileView,
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_IS_ACCESSIBLE_BY]: !isMobileView,
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_CREATED_AT]: !(isMobileView || isTabletView),
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.IS_PASSWORD_PROTECTED]: !(isMobileView || isTabletView),
    }),
    [isMobileView, isTabletView],
  );

  return (
    <ScrollableTable
        columns={getPublicShareTableColumns(false)}
        data={shares}
        filterKey={PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_NAME}
        filterPlaceHolderText="filesharing.publicFileSharing.searchSharedFiles"
        onRowSelectionChange={handleRowSelectionChange}
        isLoading={isLoading}
        selectedRows={selectedRows}
        getRowId={({ publicShareId }) => publicShareId}
        applicationName={APPS.FILE_SHARING}
        initialColumnVisibility={initialColumnVisibility}
      />
  );
};

export default PublicShareTable;
