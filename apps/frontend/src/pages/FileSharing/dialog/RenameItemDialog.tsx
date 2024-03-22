import React, { FC, ReactNode, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/shared/Button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import useFileManagerStore from '@/store/fileManagerStore';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import { getPathWithoutFileName, validateDirectoryName, validateFileName } from '@/utils/common';
import { ContentType, DirectoryFile } from '@/datatypes/filesystem';
import useMediaQuery from '@/hooks/media/useMediaQuery';

interface RenameContentDialogProps {
  trigger: ReactNode;
  item: DirectoryFile;
}

const RenameItemDialog: FC<RenameContentDialogProps> = ({ trigger, item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [localFileName, setLocalFileName] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { setFileOperationSuccessful, handleWebDavAction } = useFileManagerStore();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    setLocalFileName('');
  };

  const renameFile = async (oldName: string, newName: string) => {
    await handleWebDavAction(() => WebDavFunctions.renameItem(oldName, newName))
      .then((resp) => {
        if ('message' in resp) {
          setFileOperationSuccessful(resp.success, resp.message);
        } else {
          setFileOperationSuccessful(resp.success, '');
        }
        setIsOpen(false);
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setFileOperationSuccessful(false, errorMessage);
        setIsOpen(false);
      });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    setLocalFileName(name);
    setIsNameValid(
      item.type === ContentType.file ? validateFileName(name).isValid : validateDirectoryName(name).isValid,
    );
  };

  const mobileContent = (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Rename {item.type === ContentType.file ? 'File' : 'Directory'}</SheetTitle>
        </SheetHeader>
        <SheetDescription>
          <Input
            placeholder="New name"
            value={localFileName}
            onChange={handleInputChange}
          />
        </SheetDescription>
        <div className="mt-4 flex justify-end px-6">
          <Button
            variant="btn-collaboration"
            disabled={!isNameValid}
            onClick={() => {
              renameFile(item.filename, `${getPathWithoutFileName(item.filename)}/${localFileName}`).catch(() => {});
            }}
          >
            Rename
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  const desktopContent = (
    <DialogContent>
      <DialogTitle>Rename {item.type === ContentType.file ? 'File' : 'Directory'}</DialogTitle>
      <DialogDescription>
        <Input
          placeholder="New name"
          value={localFileName}
          onChange={handleInputChange}
        />
      </DialogDescription>
      <Button
        disabled={!isNameValid}
        onClick={() => {
          renameFile(item.filename, `${getPathWithoutFileName(item.filename)}/${localFileName}`).catch((error) =>
            console.error(error),
          );
        }}
      >
        Rename
      </Button>
    </DialogContent>
  );

  return isMobile ? (
    mobileContent
  ) : (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {desktopContent}
    </Dialog>
  );
};

export default RenameItemDialog;
