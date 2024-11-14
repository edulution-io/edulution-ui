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

interface MoveContentDialogBodyProps {
  showAllFiles?: boolean;
  pathToFetch?: string;
  showSelectedFile?: boolean;
  showHome?: boolean;
}

const MoveContentDialogBody: React.FC<MoveContentDialogBodyProps> = ({
  showAllFiles = false,
  pathToFetch,
  showSelectedFile = true,
  showHome = true,
}) => {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState(pathToFetch || '');
  const { setMoveOrCopyItemToPath, moveOrCopyItemToPath } = useFileSharingDialogStore();
  const { fetchDirs, fetchFiles, files } = useFileSharingStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue({}) : updaterOrValue;

    const selectedItemData = Object.keys(newValue)
      .filter((key) => newValue[key])
      .map((rowId) => files.find((file) => file.filename === rowId))
      .filter(Boolean) as DirectoryFileDTO[];

    setMoveOrCopyItemToPath(selectedItemData[0]);
  };

  useEffect(() => {
    if (showAllFiles && !pathToFetch) {
      void fetchFiles(currentPath);
    }
    if (pathToFetch && showAllFiles) {
      if (currentPath.includes(pathToFetch)) {
        void fetchFiles(currentPath);
      } else {
        void fetchFiles(pathToFetch);
      }
    } else {
      void fetchDirs(currentPath);
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

  return (
    <>
      <DirectoryBreadcrumb
        path={currentPath}
        onNavigate={handleBreadcrumbNavigate}
        showHome={showHome}
        hiddenSegments={getHiddenSegments()}
      />
      <ScrollableTable
        columns={FileSharingTableColumns}
        data={files}
        sorting={[]}
        setSorting={() => {}}
        selectedRows={moveOrCopyItemToPath ? { [moveOrCopyItemToPath.filename]: true } : {}}
        onRowSelectionChange={handleRowSelectionChange}
        applicationName={APPS.FILE_SHARING}
        getRowId={(row) => row.filename}
        showHeader={false}
        additionalScrollContainerOffset={20}
        textColorClass="text-black"
      />
      {moveOrCopyItemToPath && showSelectedFile && (
        <p className="pt-10 text-foreground">
          {t('moveItemDialog.selectedItem')}: {decodeURIComponent(moveOrCopyItemToPath.basename)}
        </p>
      )}
    </>
  );
};

export default MoveContentDialogBody;
