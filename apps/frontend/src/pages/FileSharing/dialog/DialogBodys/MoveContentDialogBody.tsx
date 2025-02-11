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

import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import DirectoryBreadcrumb from '@/pages/FileSharing/breadcrumb/DirectoryBreadcrumb';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/useFileSharingDialogStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import FileSharingTableColumns from '@/pages/FileSharing/table/FileSharingTableColumns';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import FILESHARING_TABLE_COLUM_NAMES from '@libs/filesharing/constants/filesharingTableColumNames';
import MoveContentDialogBodyProps from '@libs/filesharing/types/moveContentDialogProps';
import ContentType from '@libs/filesharing/types/contentType';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const MoveContentDialogBody: React.FC<MoveContentDialogBodyProps> = ({
  showAllFiles = false,
  pathToFetch,
  showSelectedFile = true,
  showHome = true,
  fileType,
}) => {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState(pathToFetch || '');
  const { setMoveOrCopyItemToPath, moveOrCopyItemToPath } = useFileSharingDialogStore();
  const { fetchDialogDirs, fetchDialogFiles, dialogShownDirs, dialogShownFiles, isLoading } = useFileSharingStore();

  const files = fileType === ContentType.DIRECTORY ? dialogShownDirs : dialogShownFiles;

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue({}) : updaterOrValue;

    const selectedItemData = Object.keys(newValue)
      .filter((key) => newValue[key])
      .map((rowId) => files.find((file) => file.filename === rowId))
      .filter(Boolean) as DirectoryFileDTO[];

    setMoveOrCopyItemToPath(selectedItemData[0]);
  };

  const fetchMechanism = fileType === ContentType.DIRECTORY ? fetchDialogDirs : fetchDialogFiles;

  useEffect(() => {
    if (showAllFiles && !pathToFetch) {
      void fetchMechanism(currentPath);
    }
    if (pathToFetch && showAllFiles) {
      if (currentPath.includes(pathToFetch)) {
        void fetchMechanism(currentPath);
      } else {
        void fetchMechanism(pathToFetch);
      }
    } else {
      void fetchMechanism(currentPath);
    }
  }, [currentPath]);

  const handleBreadcrumbNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const getHiddenSegments = (): string[] => {
    const segements = pathToFetch?.split('/');
    const index = segements?.findIndex((segment) => segment === segements.at(segment.length));
    return segements?.slice(0, index) || [];
  };

  const onFilenameClick = (row: DirectoryFileDTO) => {
    if (row.type === ContentType.DIRECTORY) {
      setCurrentPath(row.filename);
    }
  };

  const footer = (
    <div className="bottom-0 bg-gray-100 p-4 text-sm text-foreground">
      {moveOrCopyItemToPath?.basename && showSelectedFile ? (
        <p className="bg-gray-100">
          {t('moveItemDialog.selectedItem')}: {moveOrCopyItemToPath.basename}
        </p>
      ) : (
        <p className="bg-gray-100">
          <p>Select a File </p>
        </p>
      )}
    </div>
  );

  const columns = FileSharingTableColumns(onFilenameClick, [FILESHARING_TABLE_COLUM_NAMES.SELECT_FILENAME]);

  return (
    <div className="flex h-[60vh] flex-col text-background">
      <LoadingIndicator isOpen={isLoading} />
      <div className="pb-2">
        <DirectoryBreadcrumb
          path={currentPath}
          onNavigate={handleBreadcrumbNavigate}
          showHome={showHome}
          hiddenSegments={getHiddenSegments()}
          showTitle={false}
        />
      </div>
      {!isLoading && (
        <ScrollableTable
          columns={columns}
          data={files}
          selectedRows={moveOrCopyItemToPath ? { [moveOrCopyItemToPath.filename]: true } : {}}
          onRowSelectionChange={handleRowSelectionChange}
          applicationName={APPS.FILE_SHARING}
          getRowId={(row) => row.filename}
          showHeader={false}
          textColorClass="text-background"
          showSelectedCount={false}
          footer={footer}
          filterKey="select-filename"
          filterPlaceHolderText="filesharing.filterPlaceHolderText"
        />
      )}
    </div>
  );
};

export default MoveContentDialogBody;
