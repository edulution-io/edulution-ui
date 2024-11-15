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

const MoveContentDialogBody: React.FC<MoveContentDialogBodyProps> = ({
  showAllFiles = false,
  pathToFetch,
  showSelectedFile = true,
  showHome = true,
}) => {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState(pathToFetch || '');
  const { setMoveOrCopyItemToPath, moveOrCopyItemToPath } = useFileSharingDialogStore();
  const { fetchDialogDirs, fetchDialogFiles, dialogShownFiles } = useFileSharingStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue({}) : updaterOrValue;

    const selectedItemData = Object.keys(newValue)
      .filter((key) => newValue[key])
      .map((rowId) => dialogShownFiles.find((file) => file.filename === rowId))
      .filter(Boolean) as DirectoryFileDTO[];

    setMoveOrCopyItemToPath(selectedItemData[0]);
  };

  useEffect(() => {
    if (showAllFiles && !pathToFetch) {
      void fetchDialogFiles(currentPath);
    }
    if (pathToFetch && showAllFiles) {
      if (currentPath.includes(pathToFetch)) {
        void fetchDialogFiles(currentPath);
      } else {
        void fetchDialogFiles(pathToFetch);
      }
    } else {
      void fetchDialogDirs(currentPath);
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

  const onFilenameClick = (filenamePath: string) => {
    setCurrentPath(filenamePath);
  };

  const selectedFileBoxId = 'selectedFileBoxId';

  const columns = FileSharingTableColumns(onFilenameClick, [FILESHARING_TABLE_COLUM_NAMES.SELECT_FILENAME]);

  return (
    <>
      <DirectoryBreadcrumb
        path={currentPath}
        onNavigate={handleBreadcrumbNavigate}
        showHome={showHome}
        hiddenSegments={getHiddenSegments()}
      />
      <div className="h-[60vh]">
        <ScrollableTable
          columns={columns}
          data={dialogShownFiles}
          sorting={[]}
          setSorting={() => {}}
          selectedRows={moveOrCopyItemToPath ? { [moveOrCopyItemToPath.filename]: true } : {}}
          onRowSelectionChange={handleRowSelectionChange}
          applicationName={APPS.FILE_SHARING}
          getRowId={(row) => row.filename}
          showHeader={false}
          textColorClass="text-black"
          scrollContainerOffsetElementIds={{ others: [selectedFileBoxId] }}
          additionalScrollContainerOffset={350}
        />
      </div>
      <div
        className="sticky bottom-0 text-sm text-foreground"
        id={selectedFileBoxId}
      >
        {moveOrCopyItemToPath?.basename && showSelectedFile ? (
          <p className="bg-gray-100 p-4">
            {t('moveItemDialog.selectedItem')}: {moveOrCopyItemToPath.basename}
          </p>
        ) : (
          <p className="p-4">&nbsp;</p>
        )}
      </div>
    </>
  );
};

export default MoveContentDialogBody;
