import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Button } from '@/components/shared/Button';
import DirectoryBreadcrumb from '@/pages/FileSharing/DirectoryBreadcrumb';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import useFileManagerStore from '@/store/fileManagerStore';
import { ContentType, DirectoryFile } from '@/datatypes/filesystem';
import { getFileNameFromPath } from '@/pages/FileSharing/utilities/fileManagerCommon';

interface MoveItemDialogProps {
  trigger: ReactNode;
  item: DirectoryFile | DirectoryFile[];
}

const MoveItemDialog: FC<MoveItemDialogProps> = ({ trigger, item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [directorys, setDirectorys] = useState<DirectoryFile[]>([]);
  const [selectedRow, setSelectedRow] = useState<DirectoryFile>();
  const [currentPath, setCurrentPath] = useState('/teachers/netzint-teacher');
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
        backgroundColor: selectedRow?.filename === row.filename ? '#f0f0f0' : 'transparent',
        cursor: 'pointer',
      }}
    >
      <TableCell>{getFileNameFromPath(row.filename)}</TableCell>
    </TableRow>
  );

  const renderDirectoryTable = () => (
    <ScrollArea className="h-[200px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Folder Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{directorys.map(renderTableRow)}</TableBody>
      </Table>
    </ScrollArea>
  );

  const renderMoveToSection = () => (
    <>
      <p className="pt-4">Move to: {selectedRow?.filename}</p>
      <Button
        className="bg-green-600"
        disabled={!selectedRow}
        onClick={() => moveItem(item, selectedRow?.filename).catch(() => null)}
      >
        Move
      </Button>
    </>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Change Directory</DialogTitle>
        <DirectoryBreadcrumb
          path={currentPath}
          onNavigate={handleBreadcrumbNavigate}
        />
        <ScrollArea className="h-[200px]">{renderDirectoryTable()}</ScrollArea>
        {renderMoveToSection()}
      </DialogContent>
    </Dialog>
  );
};

export default MoveItemDialog;
