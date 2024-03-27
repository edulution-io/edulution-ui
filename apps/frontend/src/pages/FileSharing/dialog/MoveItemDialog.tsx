import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Button } from '@/components/shared/Button';
import DirectoryBreadcrumb from '@/pages/FileSharing/DirectoryBreadcrumb';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import useFileManagerStore from '@/store/fileManagerStore';
import { ContentType, DirectoryFile } from '@/datatypes/filesystem';
import { useTranslation } from 'react-i18next';
import { getFileNameFromPath } from '@/pages/FileSharing/utilities/fileManagerCommon';
import useMediaQuery from '@/hooks/media/useMediaQuery';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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
  const [currentPath, setCurrentPath] = useState('/students/niclass/netzint1');
  const { setFileOperationSuccessful, fetchDirectory } = useFileManagerStore();
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

  const renderAvailablePaths = () => (
    <div>
      <div className="flex space-x-2 text-black">
        <DirectoryBreadcrumb
          path={currentPath}
          onNavigate={handleBreadcrumbNavigate}
          style={{ marginRight: '0.5rem', color: isMobile ? 'white' : 'black' }}
        />
      </div>
      <Table className={`${isMobile ? 'text-white' : 'text-black'}`}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Folder Name</TableHead>
          </TableRow>
        </TableHeader>
        <ScrollArea className="h-[200px]">
          <TableBody className="flex w-full flex-col">
            {directorys.map((row) => (
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
                  backgroundColor: selectedRow?.filename === row.filename ? 'gray' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <TableCell>
                  <div className="flex flex-row justify-between space-x-4">
                    <p>{getFileNameFromPath(row.filename)}</p>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ScrollArea>
      </Table>
    </div>
  );

  const renderItemInfo = () => {
    const itemCount = Array.isArray(item) ? item.length : 1;
    const itemMessage = itemCount > 1 ? `Moving ${itemCount} items` : 'Moving 1 item';

    return (
      <>
        <div className="pb-3.5 text-black">
          {itemCount > 1 ? (
            <p className="text-black">{itemMessage}</p>
          ) : (
            <div>
              <div className={`${isMobile ? 'text-white' : 'text-black'} justify space-x-2 pb-2`}>
                <p>
                  {itemMessage}: {getFileNameFromPath(!Array.isArray(item) ? item.filename : '')}
                </p>
              </div>
            </div>
          )}
        </div>

        {Array.isArray(item) && (
          <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
            <div className="text-black">
              {item.map((files) => (
                <p
                  className="p-1"
                  key={files.etag}
                >
                  {getFileNameFromPath(files.filename)}
                </p>
              ))}
            </div>
          </ScrollArea>
        )}
        <div>{renderAvailablePaths()}</div>
        <div className="flex justify-between pt-3 text-black">
          <p className={`pt-4 ${isMobile ? 'text-white' : 'text-black'}`}>Move to: {selectedRow?.filename}</p>
          {selectedRow !== undefined ? (
            <Button
              variant="btn-collaboration"
              onClick={() => {
                moveItem(item, selectedRow?.filename).catch(() => null);
              }}
            >
              Move
            </Button>
          ) : (
            <Button
              variant="btn-collaboration"
              disabled
            >
              Move
            </Button>
          )}
        </div>
      </>
    );
  };

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
        <SheetDescription className="bg-transparent text-white">{renderItemInfo()}</SheetDescription>
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
        <DialogDescription>{renderItemInfo()}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default MoveItemDialog;
