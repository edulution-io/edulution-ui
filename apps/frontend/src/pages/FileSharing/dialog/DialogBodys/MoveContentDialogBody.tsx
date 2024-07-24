import { DirectoryFileDTO } from '@libs/filesharing/DirectoryFileDTO';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/shared/Button';
import { ArrowRightIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/ScrollArea';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import DirectoryBreadcrumb from '@/pages/FileSharing/breadcrumb/DirectoryBreadcrumb';
import useLmnApiStore from '@/store/lmnApiStore';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import EmptyDialogProps from '@libs/ui/types/filesharing/FilesharingEmptyProps';
import ContentType from '@libs/filesharing/ContentType';

const MoveContentDialogBody: React.FC<EmptyDialogProps> = () => {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState('');
  const { setMoveItemsToPath, moveItemsToPath } = useFileSharingDialogStore();
  const { fetchDirs, directorys } = useFileSharingStore();
  const { user } = useLmnApiStore();

  useEffect(() => {
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
        setMoveItemsToPath(row);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        handleNextFolder(row);
      }}
      style={{
        backgroundColor: moveItemsToPath?.filename === row.filename ? 'bg-ciDarkBlue bg-opacity-30' : 'bg-transparent',
        cursor: 'pointer',
      }}
    >
      <TableCell>
        <div className="flex w-full items-center justify-between">
          <div>{row.basename}</div>
          <Button onClick={() => handleNextFolder(row)}>
            <ArrowRightIcon />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  const renderDirectoryTable = () => (
    <ScrollArea className="h-[200px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-foreground">{t('moveItemDialog.folderName')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{directorys.map(renderTableRow)}</TableBody>
      </Table>
    </ScrollArea>
  );

  return (
    <>
      <DirectoryBreadcrumb
        path={currentPath}
        onNavigate={handleBreadcrumbNavigate}
      />
      <ScrollArea className="h-[200px]">{renderDirectoryTable()}</ScrollArea>
      {moveItemsToPath && (
        <p className="pt-10 text-foreground">
          {t('moveItemDialog.selectedItem')}: {moveItemsToPath.filename}
        </p>
      )}
    </>
  );
};

export default MoveContentDialogBody;
