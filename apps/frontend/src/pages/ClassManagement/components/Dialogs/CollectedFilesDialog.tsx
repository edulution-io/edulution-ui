import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/useFileSharingDialogStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import ContentType from '@libs/filesharing/types/contentType';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/shared/Button';
import { ArrowRightIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/ScrollArea';
import DirectoryBreadcrumb from '@/pages/FileSharing/breadcrumb/DirectoryBreadcrumb';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

interface CollectedFilesDialogProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

const CollectedFilesDialog: React.FC<CollectedFilesDialogProps> = ({ title, isOpen, onClose }) => {
  const getFooter = () => (
    <div className="mt-4 flex justify-between space-x-4">
      <button
        type="button"
        className="hover:ciRed rounded-md bg-ciLightRed px-4 py-2 text-foreground"
        onClick={onClose}
      >
        {t('classmanagement.deactivate')}
      </button>
    </div>
  );

  const getDialogBody = () => {
    const [currentPath, setCurrentPath] = useState('');
    const { setMoveOrCopyItemToPath, moveOrCopyItemToPath } = useFileSharingDialogStore();
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
        <ScrollArea className="h-[200px]">{renderTable()}</ScrollArea>
        {moveOrCopyItemToPath && (
          <p className="pt-10 text-foreground">
            {t('moveItemDialog.selectedItem')}: {moveOrCopyItemToPath.filename}
          </p>
        )}
      </>
    );
  };

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={t(`classmanagement.${title}`)}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default CollectedFilesDialog;
