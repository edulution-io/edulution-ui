import {
  DialogSH,
  DialogContentSH,
  DialogDescriptionSH,
  DialogTitleSH,
  DialogTriggerSH,
} from '@/components/ui/DialogSH.tsx';
import React, { FC, ReactNode, useState } from 'react';

import InputSH from '@/components/ui/InputSH';
import { Button } from '@/components/shared/Button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import useFileManagerStore from '@/store/fileManagerStore';
import { ContentType, DirectoryFile } from '@/datatypes/filesystem';
import {
  getPathWithoutFileName,
  validateDirectoryName,
  validateFileName,
} from '@/pages/FileSharing/utilities/fileManagerCommon';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'usehooks-ts';

interface RenameContentDialogProps {
  trigger: ReactNode;
  item: DirectoryFile;
}

const RenameItemDialog: FC<RenameContentDialogProps> = ({ trigger, item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [localFileName, setLocalFileName] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { setFileOperationSuccessful, handleWebDavAction, renameItem } = useFileManagerStore();
  const { t } = useTranslation();
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    setLocalFileName('');
  };

  const renameFile = async (oldName: string, newName: string) => {
    await handleWebDavAction(() => renameItem(oldName, newName))
      .then(async (resp) => {
        if ('message' in resp) {
          await setFileOperationSuccessful(resp.success, resp.message || '');
        } else {
          await setFileOperationSuccessful(resp.success, '');
        }
        setIsOpen(false);
      })
      .catch(async (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : t('fileRenameContent.unknownErrorOccurred');
        await setFileOperationSuccessful(false, errorMessage);
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
          <SheetTitle>
            {item.type === ContentType.file
              ? `${t('fileRenameContent.renameYourFile')}`
              : `${t('fileRenameContent.renameYourDirectory')}`}
          </SheetTitle>
        </SheetHeader>
        <SheetDescription>
          <InputSH
            placeholder={t('fileRenameContent.placeholder')}
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
            {t('fileRenameContent.rename')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  const desktopContent = (
    <DialogContentSH>
      <DialogTitleSH>
        {item.type === ContentType.file
          ? `${t('fileRenameContent.renameYourFile')}`
          : `${t('fileRenameContent.renameYourDirectory')}`}
      </DialogTitleSH>
      <DialogDescriptionSH>
        <InputSH
          placeholder={t('fileRenameContent.placeholder')}
          value={localFileName}
          onChange={handleInputChange}
        />
      </DialogDescriptionSH>
      <div className="flex flex-row justify-end space-x-4 pt-3 text-black">
        <Button
          variant="btn-collaboration"
          disabled={!isNameValid}
          onClick={() => {
            renameFile(item.filename, `${getPathWithoutFileName(item.filename)}/${localFileName}`).catch((error) =>
              console.error(error),
            );
          }}
        >
          {t('fileRenameContent.rename')}
        </Button>
      </div>
    </DialogContentSH>
  );

  return isMobile ? (
    mobileContent
  ) : (
    <DialogSH
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTriggerSH asChild>{trigger}</DialogTriggerSH>
      {desktopContent}
    </DialogSH>
  );
};

export default RenameItemDialog;
