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

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import DirectoryBreadcrumb from '@/pages/FileSharing/Table/DirectoryBreadcrumb';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import { ColumnDef, OnChangeFn, Row, RowSelectionState } from '@tanstack/react-table';
import FILESHARING_TABLE_COLUM_NAMES from '@libs/filesharing/constants/filesharingTableColumNames';
import type MoveContentDialogBodyProps from '@libs/filesharing/types/moveContentDialogBodyProps';
import ContentType from '@libs/filesharing/types/contentType';
import useFileSharingMoveDialogStore from '@/pages/FileSharing/useFileSharingMoveDialogStore';
import getFileSharingTableColumns from '@/pages/FileSharing/Table/getFileSharingTableColumns';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';
import WebdavShareSelectDropdown from './WebdavShareSelectDropdown';
import useFileSharingStore from '../../useFileSharingStore';
import useVariableSharePathname from '../../hooks/useVariableSharePathname';

const MoveContentDialogBody: React.FC<MoveContentDialogBodyProps> = ({
  showAllFiles = false,
  pathToFetch,
  showSelectedFile = true,
  showHome = true,
  fileType,
  isCurrentPathDefaultDestination = false,
  showRootOnly = false,
}) => {
  const { webdavShare } = useParams();
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState(pathToFetch || '');
  const { selectedWebdavShare, webdavShares } = useFileSharingStore();
  const { createVariableSharePathname } = useVariableSharePathname();

  const { setMoveOrCopyItemToPath, moveOrCopyItemToPath } = useFileSharingDialogStore();

  const { fetchDialogFiles, fetchDialogDirs, dialogShownDirs, dialogShownFiles, isLoading } =
    useFileSharingMoveDialogStore();

  const currentDirItem: DirectoryFileDTO = {
    filePath: currentPath,
    etag: '',
    filename: currentPath.split('/').pop() || '',
    type: ContentType.DIRECTORY,
  };

  useEffect(() => {
    setCurrentPath('/');
  }, [selectedWebdavShare]);

  useEffect(() => {
    if (!selectedWebdavShare && !webdavShare) return;
    void fetchDialogDirs(selectedWebdavShare || webdavShare, currentPath);
    if (showAllFiles) {
      void fetchDialogFiles(selectedWebdavShare || webdavShare, currentPath);
    }
  }, [webdavShare, selectedWebdavShare, currentPath, showAllFiles]);

  useEffect(() => {
    if (isCurrentPathDefaultDestination) {
      setMoveOrCopyItemToPath(currentDirItem);
    }
  }, [isCurrentPathDefaultDestination, currentPath, pathToFetch, selectedWebdavShare]);

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
      const newPath = item.original.filePath;
      setCurrentPath(newPath);
    } else {
      item.toggleSelected();
    }
  };

  const handleBreadcrumbNavigate = (path: string) => {
    if (path === '/') {
      const currentShare = webdavShares.find((s) => s.displayName === selectedWebdavShare) ?? webdavShares[0];

      let currentSharePath = currentShare.pathname;
      if (currentShare.variable) {
        currentSharePath = createVariableSharePathname(currentSharePath, currentShare.variable);
      }

      setCurrentPath(currentSharePath);
    } else {
      setCurrentPath(path);
    }
  };

  const getHiddenSegments = () =>
    webdavShares.find((s) => s.displayName === (selectedWebdavShare || webdavShare))?.pathname;

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
      <WebdavShareSelectDropdown
        webdavShare={webdavShare}
        showRootOnly={showRootOnly}
      />
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
            isDialog
          />
        )}
      </div>
      {footer}
    </>
  );
};

export default MoveContentDialogBody;
