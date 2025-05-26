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
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DirectoryBreadcrumb from '@/pages/FileSharing/Table/DirectoryBreadcrumb';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import { ColumnDef, OnChangeFn, Row, RowSelectionState } from '@tanstack/react-table';
import FILESHARING_TABLE_COLUM_NAMES from '@libs/filesharing/constants/filesharingTableColumNames';
import MoveContentDialogBodyProps from '@libs/filesharing/types/moveContentDialogProps';
import ContentType from '@libs/filesharing/types/contentType';
import useLmnApiStore from '@/store/useLmnApiStore';
import useFileSharingMoveDialogStore from '@/pages/FileSharing/useFileSharingMoveDialogStore';
import getFileSharingTableColumns from '@/pages/FileSharing/Table/FileSharingTableColumns';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';
import { getFileNameFromPath } from '@/pages/FileSharing/utilities/filesharingUtilities';
import useHistoryFileNavigationDialog from '@/pages/FileSharing/hooks/useHistoryFileNavigationDialog';

const MoveContentDialogBody: React.FC<MoveContentDialogBodyProps> = ({
  showAllFiles = false,
  pathToFetch,
  showSelectedFile = true,
  showHome = true,
  fileType,
  isCurrentPathDefaultDestination = false,
}) => {
  const { t } = useTranslation();
  const { present, past, future, navigate, goBack, goForward, setPresent } = useHistoryFileNavigationDialog(
    pathToFetch || '/',
  );
  const { user } = useLmnApiStore();

  const { setMoveOrCopyItemToPath, moveOrCopyItemToPath } = useFileSharingDialogStore();

  const { fetchDialogDirs, fetchDialogFiles, dialogShownDirs, dialogShownFiles, isLoading } =
    useFileSharingMoveDialogStore();

  const fetchMechanism = fileType === ContentType.DIRECTORY ? fetchDialogDirs : fetchDialogFiles;

  const currentDirItem: DirectoryFileDTO = {
    filename: present,
    etag: '',
    basename: present.split('/').pop() || '',
    type: ContentType.DIRECTORY,
  };

  useEffect(() => {
    if (isCurrentPathDefaultDestination) {
      setMoveOrCopyItemToPath(currentDirItem);
    }
  }, [isCurrentPathDefaultDestination, present]);

  const files = fileType === ContentType.DIRECTORY ? dialogShownDirs : dialogShownFiles;

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const selectionValue = typeof updaterOrValue === 'function' ? updaterOrValue({}) : updaterOrValue;

    const fileMap = new Map(files.map((file) => [file.filename, file]));

    const selectedItems = Object.keys(selectionValue)
      .filter((key) => selectionValue[key])
      .map((key) => fileMap.get(key))
      .filter(Boolean) as DirectoryFileDTO[];

    setMoveOrCopyItemToPath(selectedItems[0]);
  };

  const onFilenameClick = (item: Row<DirectoryFileDTO>) => {
    if (item.original.type === ContentType.DIRECTORY) {
      let newPath = present;
      if (!newPath.endsWith('/')) {
        newPath += '/';
      }
      if (newPath === '/') {
        newPath += item.original.filename.replace('/webdav/', '').replace(`server/${user?.school}/`, '');
      } else {
        newPath += getFileNameFromPath(item.original.filename);
      }
      setPresent(newPath);
    } else {
      item.toggleSelected();
    }
  };

  useEffect(() => {
    if (!showAllFiles || !pathToFetch || present.includes(pathToFetch)) {
      void fetchMechanism(present);
    } else {
      void fetchMechanism(pathToFetch);
    }
  }, [present, showAllFiles, pathToFetch]);

  const getHiddenSegments = (): string[] => {
    if (!pathToFetch) return [];
    const segments = pathToFetch.split('/');
    const index = segments.findIndex((segment) => segment === segments.at(segments.length - 1));
    return index > -1 ? segments.slice(0, index) : [];
  };

  const footer = (
    <div className="bottom-0 justify-end bg-secondary p-4 text-sm text-foreground">
      {moveOrCopyItemToPath?.basename && showSelectedFile ? (
        <p className="bg-secondary">
          {t('moveItemDialog.selectedItem')}: {decodeURIComponent(moveOrCopyItemToPath.basename)}
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
            path={present}
            onNavigate={navigate}
            onBack={goBack}
            onForward={goForward}
            showHome={showHome}
            hiddenSegments={getHiddenSegments()}
            showTitle={false}
            canGoBack={past.length > 0}
            canGoForward={future.length > 0}
          />
        </div>
        <div className="w-full">{isLoading ? <HorizontalLoader className="w-[99%]" /> : <div className="h-1" />}</div>
        {!isLoading && (
          <ScrollableTable
            columns={columns}
            data={files}
            selectedRows={moveOrCopyItemToPath ? { [moveOrCopyItemToPath.filename]: true } : {}}
            onRowSelectionChange={handleRowSelectionChange}
            applicationName={APPS.FILE_SHARING}
            getRowId={(row) => row.filename}
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
