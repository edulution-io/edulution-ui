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
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import useFileSharingMenuConfig from '@/pages/FileSharing/useMenuConfig';
import useMedia from '@/hooks/useMedia';
import getFileSharingTableColumns from '@/pages/FileSharing/Table/FileSharingTableColumns';
import FILE_SHARING_TABLE_COLUMNS from '@libs/filesharing/constants/fileSharingTableColumns';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';

const FileSharingTable = () => {
  const { isMobileView, isTabletView } = useMedia();
  const { isFilePreviewVisible, isFilePreviewDocked } = useFileEditorStore();
  const { setSelectedRows, setSelectedItems, selectedRows, files, isLoading } = useFileSharingStore();
  const { fetchShares } = usePublicShareStore();

  useEffect(() => {
    void fetchShares();
  }, []);

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(useFileSharingStore.getState().selectedRows)
        : updaterOrValue;
    setSelectedRows(newValue);
    const selectedItemData = Object.keys(newValue)
      .filter((key) => newValue[key])
      .map((rowId) => files.find((file) => file.filePath === rowId))
      .filter(Boolean) as DirectoryFileDTO[];
    setSelectedItems(selectedItemData);
  };

  const { appName } = useFileSharingMenuConfig();

  const shouldHideColumns = !(isMobileView || isTabletView || (isFilePreviewVisible && isFilePreviewDocked));

  const initialColumnVisibility = useMemo(
    () => ({
      [FILE_SHARING_TABLE_COLUMNS.LAST_MODIFIED]: shouldHideColumns,
      [FILE_SHARING_TABLE_COLUMNS.SIZE]: shouldHideColumns,
      [FILE_SHARING_TABLE_COLUMNS.TYPE]: shouldHideColumns,
      [FILE_SHARING_TABLE_COLUMNS.IS_SHARED]: shouldHideColumns,
    }),
    [shouldHideColumns],
  );

  return (
    <ScrollableTable
      columns={getFileSharingTableColumns()}
      data={files}
      filterKey={FILE_SHARING_TABLE_COLUMNS.SELECT_FILENAME}
      filterPlaceHolderText="filesharing.filterPlaceHolderText"
      onRowSelectionChange={handleRowSelectionChange}
      isLoading={isLoading}
      selectedRows={selectedRows}
      getRowId={(row) => row.filePath}
      applicationName={appName}
      initialSorting={[
        { id: 'type', desc: false },
        { id: 'select-filename', desc: false },
      ]}
      initialColumnVisibility={initialColumnVisibility}
    />
  );
};

export default FileSharingTable;
