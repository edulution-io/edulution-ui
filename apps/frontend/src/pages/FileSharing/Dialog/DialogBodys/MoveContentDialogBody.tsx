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
import DirectoryBreadcrumb from '@/pages/FileSharing/Table/DirectoryBreadcrumb';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import { ColumnDef, OnChangeFn, Row, RowSelectionState } from '@tanstack/react-table';
import FILESHARING_TABLE_COLUM_NAMES from '@libs/filesharing/constants/filesharingTableColumNames';
import MoveContentDialogBodyProps from '@libs/filesharing/types/moveContentDialogBodyProps';
import ContentType from '@libs/filesharing/types/contentType';
import useFileSharingMoveDialogStore from '@/pages/FileSharing/useFileSharingMoveDialogStore';
import getFileSharingTableColumns from '@/pages/FileSharing/Table/getFileSharingTableColumns';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';

const MoveContentDialogBody: React.FC<MoveContentDialogBodyProps> = ({
  showAllFiles = false,
  pathToFetch,
  showSelectedFile = true,
  showHome = true,
  fileType,
  isCurrentPathDefaultDestination = false,
  enableRowSelection,
  getRowDisabled,
}) => {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState(pathToFetch || '');

  const { setMoveOrCopyItemToPath, moveOrCopyItemToPath } = useFileSharingDialogStore();

  const { fetchDialogDirs, fetchDialogFiles, dialogShownDirs, dialogShownFiles, isLoading } =
    useFileSharingMoveDialogStore();

  const fetchMechanism = fileType === ContentType.DIRECTORY ? fetchDialogDirs : fetchDialogFiles;

  const currentDirItem: DirectoryFileDTO = {
    filePath: currentPath,
    etag: '',
    filename: currentPath.split('/').pop() || '',
    type: ContentType.DIRECTORY,
  };

  useEffect(() => {
    if (isCurrentPathDefaultDestination) {
      setMoveOrCopyItemToPath(currentDirItem);
    }
  }, [isCurrentPathDefaultDestination, currentPath]);

  const files = fileType === ContentType.DIRECTORY ? dialogShownDirs : dialogShownFiles;

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const selectionValue = typeof updaterOrValue === 'function' ? updaterOrValue({}) : updaterOrValue;

    const fileMap = new Map(files.map((file) => [file.filePath, file]));

    const selectedItems = Object.keys(selectionValue)
      .filter((key) => selectionValue[key])
      .map((key) => fileMap.get(key))
      .filter(Boolean) as DirectoryFileDTO[];

    setMoveOrCopyItemToPath(selectedItems[0]);
  };

  const onFilenameClick = (item: Row<DirectoryFileDTO>) => {
    if (item.original.type === ContentType.DIRECTORY) {
      let newPath = item.original.filePath;

      if (!newPath.endsWith('/')) {
        newPath += '/';
      }

      setCurrentPath(newPath);
    } else {
      item.toggleSelected();
    }
  };

  useEffect(() => {
    if (!showAllFiles || !pathToFetch || currentPath.includes(pathToFetch)) {
      void fetchMechanism(currentPath);
    } else {
      void fetchMechanism(pathToFetch);
    }
  }, [currentPath, showAllFiles, pathToFetch]);

  const handleBreadcrumbNavigate = (path: string) => {
    const newPath = path.replace('webdav/', '');
    setCurrentPath(newPath);
  };

  const getHiddenSegments = (): string[] => {
    if (!pathToFetch) return [];
    const segments = pathToFetch.split('/');
    const index = segments.findIndex((segment) => segment === segments.at(segments.length - 1));
    return index > -1 ? segments.slice(0, index) : [];
  };

  const footer = (
    <div className="bottom-0 justify-end bg-secondary p-4 text-sm text-foreground">
      {moveOrCopyItemToPath?.filename && showSelectedFile ? (
        <p className="bg-secondary">
          {t('moveItemDialog.selectedItem')}: {decodeURIComponent(moveOrCopyItemToPath.filename)}
        </p>
      ) : (
        <p className="bg-secondary">
          <span>{t('filesharing.selectFile')}</span>
        </p>
      )}
    </div>
  );

  const visibleColumns = [FILESHARING_TABLE_COLUM_NAMES.SELECT_FILENAME];
  const columns: ColumnDef<DirectoryFileDTO>[] = getFileSharingTableColumns(visibleColumns, onFilenameClick);

  return (
    <>
      <div className="h-[60vh] flex-col overflow-auto text-background scrollbar-thin">
        <div className="pb-2">
          <DirectoryBreadcrumb
            path={currentPath}
            onNavigate={handleBreadcrumbNavigate}
            showHome={showHome}
            hiddenSegments={getHiddenSegments()}
            showTitle={false}
          />
        </div>
        <div className="w-full">{isLoading ? <HorizontalLoader className="w-[99%]" /> : <div className="h-1" />}</div>
        {!isLoading && (
          <ScrollableTable
            columns={columns}
            data={files}
            selectedRows={moveOrCopyItemToPath ? { [moveOrCopyItemToPath.filePath]: true } : {}}
            onRowSelectionChange={handleRowSelectionChange}
            applicationName={APPS.FILE_SHARING}
            getRowId={(row) => row.filePath}
            showHeader={false}
            textColorClassname="text-background"
            showSelectedCount={false}
            filterKey="select-filename"
            filterPlaceHolderText="filesharing.filterPlaceHolderText"
            enableRowSelection={enableRowSelection}
            getRowDisabled={getRowDisabled}
            isDialog
          />
        )}
      </div>
      {footer}
    </>
  );
};

export default MoveContentDialogBody;
