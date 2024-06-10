import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Button } from '@/components/shared/Button';
import DirectoryBreadcrumb from '@/pages/FileSharing/DirectoryBreadcrumb';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import useFileManagerStoreOLD from '@/store/fileManagerStoreOLD';
import { ContentType, DirectoryFile } from '@/datatypes/filesystem';
import { useTranslation } from 'react-i18next';
import { getFileNameFromPath } from '@/pages/FileSharing/utilities/fileManagerCommon';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { useMediaQuery } from 'usehooks-ts';
import { ArrowRightIcon } from 'lucide-react';

interface MoveItemDialogProps {
  trigger: ReactNode;
  item: DirectoryFile | DirectoryFile[];
}

const MoveItemDialog: FC<MoveItemDialogProps> = ({ trigger, item }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [directorys, setDirectorys] = useState<DirectoryFile[]>([]);
  const [selectedRow, setSelectedRow] = useState<DirectoryFile>();
  const [currentPath, setCurrentPath] = useState('');
  const { setFileOperationSuccessful, fetchDirectory } = useFileManagerStoreOLD();
  useEffect(() => {
    if (isOpen) {
      fetchDirectory(currentPath)
        .then(setDirectorys)
        .catch(() => null);
    }
  }, [currentPath, isOpen]);

  const handleBreadcrumbNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchDirectory(currentPath)
        .then(setDirectorys)
        .catch(() => null);
    }
  };

  const handleNextFolder = (nextItem: DirectoryFile) => {
    if (nextItem.type === ContentType.directory) {
      let newCurrentPath = currentPath;
      if (!newCurrentPath.endsWith('/')) {
        newCurrentPath += '/';
      }
      newCurrentPath += getFileNameFromPath(nextItem.filename);

      setCurrentPath(newCurrentPath);
    }
  };

  const moveItem = async (items: DirectoryFile | DirectoryFile[], toPath: string | undefined) => {
    await WebDavFunctions.moveItems(items, toPath)
      .then((resp) => {
        if ('message' in resp) {
          setFileOperationSuccessful(resp.success, resp.message);
        } else {
          setFileOperationSuccessful(resp.success, '');
        }
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setFileOperationSuccessful(false, errorMessage);
      });
    setIsOpen(false);
  };

  const renderTableRow = (row: DirectoryFile) => (
    <TableRow
      key={row.filename}
      onClick={(e) => {
        e.preventDefault();
        setSelectedRow(row);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        handleNextFolder(row);
      }}
      style={{
        backgroundColor: selectedRow?.filename === row.filename ? 'bg-ciDarkBlue bg-opacity-30' : 'bg-transparent',
        cursor: 'pointer',
        color: isMobile ? 'white' : 'black',
      }}
    >
      <TableCell>
        <div className="flex w-full items-center justify-between">
          <div>{getFileNameFromPath(row.filename)}</div>
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
            <TableHead className={`${isMobile ? 'text-white' : 'text-black'}`}>
              {t('moveItemDialog.folderName')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{directorys.map(renderTableRow)}</TableBody>
      </Table>
    </ScrollArea>
  );

  const renderMoveToSection = () => (
    <>
      {selectedRow && (
        <p className={`${isMobile ? 'text-white' : 'text-black'}`}>
          {t('moveItemDialog.selectedItem')}: {selectedRow.filename}
        </p>
      )}
      <div className="flex justify-end">
        <Button
          variant="btn-collaboration"
          disabled={!selectedRow}
          onClick={() => {
            try {
              moveItem(item, selectedRow?.filename).catch((error) => console.error(error));
            } catch (error) {
              console.error(error);
            }
          }}
        >
          {t('moveItemDialog.move')}
        </Button>
      </div>
    </>
  );

  return isMobile ? (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>{t('moveItemDialog.changeDirectory')}</SheetTitle>
        </SheetHeader>
        <DirectoryBreadcrumb
          path={currentPath}
          onNavigate={handleBreadcrumbNavigate}
          style={{ color: 'white' }}
        />
        <ScrollArea className="h-[200px]">{renderDirectoryTable()}</ScrollArea>
        {renderMoveToSection()}
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>{t('moveItemDialog.changeDirectory')}</DialogTitle>
        <DirectoryBreadcrumb
          path={currentPath}
          onNavigate={handleBreadcrumbNavigate}
          style={{ color: 'white' }}
        />
        <ScrollArea className="h-[200px]">{renderDirectoryTable()}</ScrollArea>
        {renderMoveToSection()}
      </DialogContent>
    </Dialog>
  );
};

export default MoveItemDialog;
