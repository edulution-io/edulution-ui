import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Button } from '@/components/shared/Button';
import DirectoryBreadcrumb from '@/pages/FileSharing/DirectoryBreadcrumb';
import useFileManagerStore from '@/store/fileManagerStore';
import { ContentType, DirectoryFile } from '@/datatypes/filesystem';
import { useTranslation } from 'react-i18next';
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
  const [selectedRow, setSelectedRow] = useState<DirectoryFile>();
  const [currentPath, setCurrentPath] = useState('/');
  const { setFileOperationSuccessful, fetchDirs, moveItem, directorys } = useFileManagerStore();

  useEffect(() => {
    if (isOpen) {
      fetchDirs(currentPath).catch((error) => {
        console.error('Error fetching directories:', error);
      });
    }
  }, [currentPath, isOpen]);

  const handleBreadcrumbNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchDirs(currentPath).catch((error) => {
        console.error('Error fetching directories on open change:', error);
      });
    }
  };

  const handleNextFolder = (nextItem: DirectoryFile) => {
    if (nextItem.type === ContentType.directory) {
      let newCurrentPath = currentPath;
      if (!newCurrentPath.endsWith('/')) {
        newCurrentPath += '/';
      }
      if (newCurrentPath === '/') {
        newCurrentPath += nextItem.filename.replace('/webdav/', '').replace('server/agy/', '');
      } else {
        newCurrentPath += nextItem.basename;
      }
      setCurrentPath(newCurrentPath);
    }
  };

  const moveItems = async (items: DirectoryFile | DirectoryFile[], toPath: string | undefined) => {
    if (!toPath) return;

    const originPaths = Array.isArray(items) ? items.map((file) => file.filename) : [items.filename];

    const movePromises = originPaths.map((originPath) => moveItem(originPath, toPath));

    try {
      const results = await Promise.all(movePromises);
      const success = results.every((result) => result.success);
      const message = success
        ? t('fileCreateNewContent.fileOperationSuccessful')
        : t('fileCreateNewContent.unknownErrorOccurred');
      await setFileOperationSuccessful(success, message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      await setFileOperationSuccessful(false, errorMessage);
    }

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
              moveItems(item, selectedRow?.filename).catch((error) => console.error(error));
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
