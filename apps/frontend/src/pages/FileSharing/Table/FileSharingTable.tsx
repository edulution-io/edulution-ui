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
import useMedia from '@/hooks/useMedia';
import getFileSharingTableColumns from '@/pages/FileSharing/Table/getFileSharingTableColumns';
import FILE_SHARING_TABLE_COLUMNS from '@libs/filesharing/constants/fileSharingTableColumns';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import { useParams } from 'react-router-dom';
import ContentType from '@libs/filesharing/types/contentType';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import FileActionType from '@libs/filesharing/types/fileActionType';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { HttpMethods } from '@libs/common/types/http-methods';
import PathChangeOrCreateDto from '@libs/filesharing/types/pathChangeOrCreateProps';

const FileSharingTable = () => {
  const { webdavShare } = useParams();

  const { isMobileView, isTabletView } = useMedia();
  const { isFilePreviewVisible, isFilePreviewDocked } = useFileEditorStore();
  const { handleItemAction } = useFileSharingDialogStore();
  const appConfigs = useAppConfigsStore((s) => s.appConfigs);
  const { setSelectedRows, setSelectedItems, fetchFiles, selectedRows, files, isLoading, currentPath } =
    useFileSharingStore();

  useEffect(() => {
    if (currentPath !== '/') void fetchFiles(webdavShare, currentPath);
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

  const handleFileDrop = async (sourceFile: DirectoryFileDTO, targetFolder: DirectoryFileDTO) => {
    try {
      const sourcePath = sourceFile.filePath;
      const targetPath = `${targetFolder.filePath}/${sourceFile.filename}`;
      await handleItemAction(
        FileActionType.MOVE_FILE_OR_FOLDER,
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}`,
        HttpMethods.PATCH,
        ContentType.FILE || ContentType.DIRECTORY,
        [
          {
            path: sourcePath.endsWith('/') ? sourcePath.slice(0, -1) : sourcePath,
            newPath: targetPath,
          },
        ] as PathChangeOrCreateDto[],
        webdavShare,
      );
    } catch (error) {
      console.error('Fehler beim Verschieben:', error);
    }
  };

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

  const isDocumentServerConfigured = !!getExtendedOptionsValue(
    appConfigs,
    APPS.FILE_SHARING,
    ExtendedOptionKeys.ONLY_OFFICE_URL,
  );

  return (
    <ScrollableTable
      columns={getFileSharingTableColumns(undefined, undefined, isDocumentServerConfigured)}
      data={files}
      filterKey={FILE_SHARING_TABLE_COLUMNS.SELECT_FILENAME}
      filterPlaceHolderText="filesharing.filterPlaceHolderText"
      onRowSelectionChange={handleRowSelectionChange}
      isLoading={isLoading}
      selectedRows={selectedRows}
      getRowId={(row) => row.filePath}
      applicationName={APPS.FILE_SHARING}
      initialSorting={[
        { id: 'type', desc: false },
        { id: 'select-filename', desc: false },
      ]}
      initialColumnVisibility={initialColumnVisibility}
      enableDragAndDrop
      onFileDrop={handleFileDrop}
      canDropOnRow={(file) => file.type === ContentType.DIRECTORY}
    />
  );
};

export default FileSharingTable;
