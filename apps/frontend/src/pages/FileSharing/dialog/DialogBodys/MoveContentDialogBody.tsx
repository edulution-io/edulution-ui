import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/shared/Button';
import { ArrowRightIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/ScrollArea';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import DirectoryBreadcrumb from '@/pages/FileSharing/breadcrumb/DirectoryBreadcrumb';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/useFileSharingDialogStore';
import ContentType from '@libs/filesharing/types/contentType';
import useLmnApiStore from '@/store/useLmnApiStore';

interface MoveContentDialogBodyProps {
  showAllFiles?: boolean;
}

const MoveContentDialogBody: React.FC<MoveContentDialogBodyProps> = ({ showAllFiles = false }) => {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState('');
  const { setMoveOrCopyItemToPath, moveOrCopyItemToPath } = useFileSharingDialogStore();
  const { fetchDirs, fetchFiles, directorys, files } = useFileSharingStore();
  const { user } = useLmnApiStore();

  useEffect(() => {
    if (showAllFiles) {
      void fetchFiles(currentPath);
    }
    void fetchDirs(currentPath);
  }, [currentPath]);

  const handleBreadcrumbNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleNextFolder = (nextItem: DirectoryFileDTO) => {
    if (nextItem.type === ContentType.DIRECTORY) {
      let newCurrentPath = currentPath;
      if (!newCurrentPath.endsWith('/')) {
        newCurrentPath += '/';
      }
      if (newCurrentPath === '/') {
        newCurrentPath += nextItem.filename.replace('/webdav/', '').replace(`server/${user?.school}/`, '');
      } else {
        newCurrentPath += nextItem.basename;
      }
      setCurrentPath(newCurrentPath);
    }
  };

  const renderTableRow = (row: DirectoryFileDTO) => (
    <TableRow
      key={row.filename}
      onClick={(e) => {
        e.preventDefault();
        setMoveOrCopyItemToPath(row);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        handleNextFolder(row);
      }}
    >
      <TableCell
        className={moveOrCopyItemToPath.basename === row.basename ? 'bg-ciLightBlue text-black' : 'text-black'}
      >
        <div className="flex w-full items-center justify-between">
          <div>{row.basename}</div>
          <Button onClick={() => handleNextFolder(row)}>
            <ArrowRightIcon />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  const renderTable = () => (
    <ScrollArea className="h-[200px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-foreground">{t('moveItemDialog.folderName')}</TableHead>
          </TableRow>
        </TableHeader>
        {showAllFiles ? (
          <TableBody>{files.map(renderTableRow)}</TableBody>
        ) : (
          <TableBody>{directorys.map(renderTableRow)}</TableBody>
        )}
      </Table>
    </ScrollArea>
  );

  return (
    <>
      <DirectoryBreadcrumb
        path={currentPath}
        onNavigate={handleBreadcrumbNavigate}
      />
      <ScrollArea className="h-[200px]">{renderTable()}</ScrollArea>
      {moveOrCopyItemToPath && (
        <p className="pt-10 text-foreground">
          {t('moveItemDialog.selectedItem')}: {moveOrCopyItemToPath.filename}
        </p>
      )}
    </>
  );
};

export default MoveContentDialogBody;
