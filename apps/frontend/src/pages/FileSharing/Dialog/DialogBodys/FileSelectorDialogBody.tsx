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

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef, OnChangeFn, Row, RowSelectionState } from '@tanstack/react-table';

import DirectoryBreadcrumb from '@/pages/FileSharing/Table/DirectoryBreadcrumb';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';

import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import useFileSharingMoveDialogStore from '@/pages/FileSharing/useFileSharingMoveDialogStore';
import getFileSharingTableColumns from '@/pages/FileSharing/Table/getFileSharingTableColumns';

import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import FILESHARING_TABLE_COLUM_NAMES from '@libs/filesharing/constants/filesharingTableColumNames';
import APPS from '@libs/appconfig/constants/apps';
import ContentType from '@libs/filesharing/types/contentType';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import FileSelectorDialogProps from '@libs/filesharing/types/fileSelectorDialogProps';
import useOpenFileDialogStore from '@/pages/FileSharing/useOpenFileDialogStore';

const FileSelectorDialogBody: React.FC<FileSelectorDialogProps> = ({
  initialPath = '',
  showHome = true,
  showFooterSelection = true,
}) => {
  const { t } = useTranslation();

  const { moveOrCopyItemToPath, setMoveOrCopyItemToPath } = useFileSharingDialogStore();

  const { allowedExtensions } = useOpenFileDialogStore();

  const { fetchDialogDirs, fetchDialogFiles, dialogShownDirs, dialogShownFiles, isLoading } =
    useFileSharingMoveDialogStore();

  const [currentPath, setCurrentPath] = useState(initialPath);

  const normalizePath = (path: string) => (path.endsWith('/') ? path.slice(0, -1) : path);

  const fileHasAllowedExtension = (filename: string) => {
    if (!allowedExtensions.length) return true;
    const lowercaseFilename = filename.toLowerCase();
    return allowedExtensions.some((extension) => lowercaseFilename.endsWith(extension.toLowerCase()));
  };

  const tableRows: DirectoryFileDTO[] = useMemo(() => {
    const filePathToDirectoryFileMap = new Map<string, DirectoryFileDTO>();
    [...dialogShownDirs, ...dialogShownFiles].forEach((directoryFile) => {
      filePathToDirectoryFileMap.set(normalizePath(directoryFile.filePath), directoryFile);
    });
    return Array.from(filePathToDirectoryFileMap.values());
  }, [dialogShownDirs, dialogShownFiles]);

  useEffect(() => {
    void Promise.all([fetchDialogDirs(currentPath), fetchDialogFiles(currentPath)]);
  }, [currentPath, fetchDialogDirs, fetchDialogFiles]);

  const handleRowClick = (row: Row<DirectoryFileDTO>) => {
    const clickedItem = row.original;

    if (clickedItem.type === ContentType.DIRECTORY) {
      let newDirectoryPath = clickedItem.filePath;
      if (!newDirectoryPath.endsWith('/')) {
        newDirectoryPath += '/';
      }
      setCurrentPath(newDirectoryPath);
      return;
    }

    if (clickedItem.type === ContentType.FILE && fileHasAllowedExtension(clickedItem.filename)) {
      setMoveOrCopyItemToPath(clickedItem);
    }
  };

  const visibleColumns = [FILESHARING_TABLE_COLUM_NAMES.SELECT_FILENAME];
  const columns: ColumnDef<DirectoryFileDTO>[] = getFileSharingTableColumns(visibleColumns, handleRowClick);

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updatedOrNewRowSelectionState) => {
    const rowSelectionState =
      typeof updatedOrNewRowSelectionState === 'function'
        ? updatedOrNewRowSelectionState({})
        : updatedOrNewRowSelectionState;

    const filePathToDirectoryFileMap = new Map(
      tableRows.map((directoryFile) => [normalizePath(directoryFile.filePath), directoryFile]),
    );

    const selectedDirectoryFiles = Object.keys(rowSelectionState)
      .filter((rowKey) => rowSelectionState[rowKey])
      .map((rowKey) => filePathToDirectoryFileMap.get(rowKey))
      .filter((directoryFile): directoryFile is DirectoryFileDTO => Boolean(directoryFile));

    const firstSelectedFile = selectedDirectoryFiles.find(
      (directoryFile) => directoryFile.type === ContentType.FILE && fileHasAllowedExtension(directoryFile.filename),
    );

    if (firstSelectedFile) {
      setMoveOrCopyItemToPath(firstSelectedFile);
    } else {
      setMoveOrCopyItemToPath(undefined as unknown as DirectoryFileDTO);
    }
  };

  const handleBreadcrumbNavigate = (rawPath: string) => {
    const cleanedPath = getPathWithoutWebdav(rawPath);
    setCurrentPath(cleanedPath);
  };

  const getHiddenSegments = (): string[] => {
    if (!initialPath) return [];
    const pathSegments = initialPath.split('/');
    const lastIndex = pathSegments.findIndex((segment) => segment === pathSegments.at(pathSegments.length - 1));
    return lastIndex > -1 ? pathSegments.slice(0, lastIndex) : [];
  };

  let footerContent;

  if (showFooterSelection) {
    if (moveOrCopyItemToPath?.filename) {
      footerContent = (
        <p className="bg-secondary">
          {t('fileSelectorDialogBody.selectFile')}: {decodeURIComponent(moveOrCopyItemToPath.filename)}
        </p>
      );
    } else {
      footerContent = <p className="bg-secondary">{t('fileSelectorDialogBody.selectFile')}</p>;
    }
  }

  const footer = (
    <div className="bottom-0 flex items-center justify-between bg-secondary p-4 text-sm text-foreground">
      {footerContent}
    </div>
  );

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

        <div className="w-full">
          {isLoading ? (
            <HorizontalLoader className="w-[100%]" />
          ) : (
            <ScrollableTable
              columns={columns}
              data={tableRows}
              selectedRows={
                moveOrCopyItemToPath && moveOrCopyItemToPath.type === ContentType.FILE
                  ? { [normalizePath(moveOrCopyItemToPath.filePath)]: true }
                  : {}
              }
              onRowSelectionChange={handleRowSelectionChange}
              applicationName={APPS.FILE_SHARING}
              getRowId={(row) => normalizePath(row.filePath)}
              showHeader={false}
              textColorClassname="text-background"
              showSelectedCount={false}
              filterKey="select-filename"
              filterPlaceHolderText="filesharing.filterPlaceHolderText"
              isDialog
              enableRowSelection={(row) =>
                row.original.type === ContentType.FILE && fileHasAllowedExtension(row.original.filename)
              }
              getRowDisabled={(row) =>
                row.original.type === ContentType.FILE && !fileHasAllowedExtension(row.original.filename)
              }
            />
          )}
        </div>
      </div>

      {footer}
    </>
  );
};

export default FileSelectorDialogBody;
