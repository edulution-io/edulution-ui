import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import React, { FC, ReactNode, useState } from 'react';
import Label from '@/components/ui/Label';
import {
  getFileNameFromPath,
  getPathWithoutFileName,
  validateDirectoryName,
  validateFileName,
} from '@/pages/FileSharing/utilities/fileManagerCommon';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/shared/Button';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import useFileManagerStore from '@/store/fileManagerStore';
import { ContentType, DirectoryFile } from '@/datatypes/filesystem';
import { useTranslation } from 'react-i18next';

interface RenameContentDialogProps {
  trigger: ReactNode;
  item: DirectoryFile;
}

const RenameItemDialog: FC<RenameContentDialogProps> = ({ trigger, item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [localFileName, setLocalFileName] = useState('');
  const { t } = useTranslation(); // Use the translation hook
  const fileName = getFileNameFromPath(item.filename);
  const placeholderTextKey = fileName.length > 0 ? 'fileRenameContent.to' : '';
  const { setFileOperationSuccessful, handleWebDavAction } = useFileManagerStore();
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setLocalFileName('');
    }
  };

  const handleValidateName = (name: string) => {
    const validationResult = item.type === ContentType.file ? validateFileName(name) : validateDirectoryName(name);
    setIsNameValid(validationResult.isValid);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    handleValidateName(name);
    setLocalFileName(name);
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
        const errorMessage = error instanceof Error ? error.message : t('fileRenameContent.unknownErrorOccurred');
        setFileOperationSuccessful(false, errorMessage);
        setIsOpen(false);
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
          {t(
            item.type === ContentType.directory
              ? 'fileRenameContent.renameYourDirectory'
              : 'fileRenameContent.renameYourFile',
          )}
        </DialogTitle>
        <>
          <Label className="font-bold">{fileName}</Label>
          <Input
            className="mt-3"
            placeholder={placeholderTextKey ? `${t(placeholderTextKey)} ${fileName}` : ''}
            value={localFileName}
            onChange={handleInputChange}
          />
          <div className="mx-auto flex justify-end p-4">
            <Button
              className="bg-green-600"
              disabled={!isNameValid}
              onClick={() => {
                renameFile(item.filename, `${getPathWithoutFileName(item.filename)}/${localFileName}`).catch(() => {});
              }}
            >
              {t('fileRenameContent.rename')}
            </Button>
          </div>
        </>
      </DialogContent>
    </Dialog>
  );
};

export default RenameItemDialog;
