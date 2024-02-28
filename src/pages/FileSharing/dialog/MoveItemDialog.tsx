import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Label from '@/components/ui/label';
import { getFileNameFromPath } from '@/utils/common';
import useWebDavActions from '@/utils/webDavHooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/shared/Button';
import DirectoryBreadcrumb from '@/pages/FileSharing/DirectoryBreadcrumb';
import { FaLongArrowAltRight } from 'react-icons/fa';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import { useFileManagerStore } from '@/store';
import { ContentType, DirectoryFile } from '../../../../datatypes/filesystem';

interface MoveItemDialogProps {
  trigger: ReactNode;
  item: DirectoryFile | DirectoryFile[];
}

const MoveItemDialog: FC<MoveItemDialogProps> = ({ trigger, item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [directorys, setDirectorys] = useState<DirectoryFile[]>([]);
  const [selectedRow, setSelectedRow] = useState<DirectoryFile>();
  const [currentPath, setCurrentPath] = useState('/teachers/netzint-teacher');
  const { fetchDirectory } = useWebDavActions();
  const setFileOperationSuccessful = useFileManagerStore((state) => state.setFileOperationSuccessful);
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
    try {
      await WebDavFunctions.moveItems(items, toPath)
        .then((resp) => {
          setFileOperationSuccessful(resp.success);
        })
        .catch(() => {
          setFileOperationSuccessful(false);
        });
      setIsOpen(false);
    } catch (error) {
      /* empty */
    }
  };

  const renderAvailablePaths = () => (
    <div>
      <div className="flex space-x-2">
        <p className="mr-2 text-black">Current Directory:</p>
        <DirectoryBreadcrumb
          path={currentPath}
          onNavigate={handleBreadcrumbNavigate}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Folder Name</TableHead>
          </TableRow>
        </TableHeader>
        <ScrollArea className="h-[200px]">
          <TableBody>
            {directorys.map((row) => (
              <TableRow
                key={row.filename}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedRow(row);
                }}
                style={{
                  backgroundColor: selectedRow?.filename === row.filename ? '#f0f0f0' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <TableCell>
                  <div className="flex justify-between">
                    <p>{getFileNameFromPath(row.filename)}</p>
                    <Button
                      className="bg-gray-50"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleNextFolder(row);
                      }}
                    >
                      <FaLongArrowAltRight />
                    </Button>
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
        <p className="pb-3.5">
          {itemCount > 1 ? (
            itemMessage
          ) : (
            <div>
              <div className="justify space-x-2 pb-2">
                {itemMessage}: {getFileNameFromPath(!Array.isArray(item) ? item.filename : '')}
              </div>
            </div>
          )}
        </p>
        {Array.isArray(item) && (
          <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
            <div>
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
        <div className="flex justify-between pt-3">
          <p className="pt-4">Move to: {selectedRow?.filename}</p>
          {selectedRow !== undefined ? (
            <Button
              onClick={() => {
                moveItem(item, selectedRow?.filename).catch(() => null);
              }}
            >
              Move
            </Button>
          ) : (
            <Button disabled>Move</Button>
          )}
        </div>
      </>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Change Directory</DialogTitle>
        <DialogDescription>
          <Label>{renderItemInfo()}</Label>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default MoveItemDialog;
