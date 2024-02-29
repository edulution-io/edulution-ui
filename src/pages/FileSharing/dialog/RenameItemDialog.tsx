import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import React, { FC, ReactNode, useState } from 'react';
import Label from '@/components/ui/label';
import { getFileNameFromPath, getPathWithoutFileName, validateDirectoryName, validateFileName } from '@/utils/common';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/shared/Button';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import { useFileManagerStore } from '@/store';
import useWebDavActions from '@/utils/webDavHooks';
import { ContentType, DirectoryFile } from '../../../../datatypes/filesystem';

interface RenameContentDialogProps {
  trigger: ReactNode;
  item: DirectoryFile;
}

const RenameItemDialog: FC<RenameContentDialogProps> = ({ trigger, item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [localFileName, setLocalFileName] = useState('');
  const fileName = getFileNameFromPath(item.filename);
  const placeholderText = fileName.length > 0 ? `to ${fileName}` : 'File name is empty';
  const setFileOperationSuccessful = useFileManagerStore((state) => state.setFileOperationSuccessful);
  const { handleWebDavAction } = useWebDavActions();
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setLocalFileName('');
    }
  };
  const handleValidateName = (name: string) => {
    let validationResult;
    if (item.type === ContentType.file) {
      validationResult = validateFileName(name);
    } else {
      validationResult = validateDirectoryName(name);
    }

    if (validationResult.isValid) {
      setIsNameValid(true);
    } else {
      setIsNameValid(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    handleValidateName(name);
    setLocalFileName(name);
  };

  const renameFile = async (oldName: string, newName: string) => {
    setFileOperationSuccessful(undefined);
    await handleWebDavAction(() => WebDavFunctions.renameItem(oldName, newName))
      .then((resp) => {
        setFileOperationSuccessful(resp.success);
      })
      .catch(() => {
        setFileOperationSuccessful(false);
      });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>
          Rename your {item.type === ContentType.directory ? ContentType.directory : ContentType.file}
        </DialogTitle>
        <DialogDescription>
          <Label className="font-bold">{getFileNameFromPath(item.filename)}</Label>
          <Input
            className="mt-3"
            placeholder={placeholderText}
            value={localFileName}
            onChange={handleInputChange}
          />
          <div className="mx-auto flex justify-end p-4 ">
            <Button
              className="bg-green-600"
              disabled={!isNameValid}
              onClick={() => {
                renameFile(item.filename, `${getPathWithoutFileName(item.filename)}/${localFileName}`).catch(() => {});
              }}
            >
              Rename
            </Button>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
export default RenameItemDialog;
