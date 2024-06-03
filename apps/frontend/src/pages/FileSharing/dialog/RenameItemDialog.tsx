import React, { FC, ReactNode } from 'react';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import { ContentType, DirectoryFile } from '@/datatypes/filesystem';
import {
  getPathWithoutFileName,
  validateDirectoryName,
  validateFileName,
} from '@/pages/FileSharing/utilities/fileManagerCommon';
import { useTranslation } from 'react-i18next';
import GeneralRenameDialog from '@/components/ui/Dialog/GeneralRenameDialog.tsx';

interface RenameContentDialogProps {
  trigger: ReactNode;
  item: DirectoryFile;
}

const RenameItemDialog: FC<RenameContentDialogProps> = ({ trigger, item }) => {
  const { setFileOperationSuccessful, handleWebDavAction, renameItem } = useFileManagerStore();
  const { t } = useTranslation();

  const isValidInput = (input: string) => {
    return item.type === ContentType.file ? validateFileName(input).isValid : validateDirectoryName(input).isValid;
  };

  const handleRename = async (newName: string) => {
    await handleWebDavAction(() => renameItem(item.filename, `${getPathWithoutFileName(item.filename)}/${newName}`))
      .then(async (resp) => {
        if ('message' in resp) {
          await setFileOperationSuccessful(resp.success, resp.message || '');
        } else {
          await setFileOperationSuccessful(resp.success, '');
        }
      })
      .catch(async (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : t('fileRenameContent.unknownErrorOccurred');
        await setFileOperationSuccessful(false, errorMessage);
      });
  };

  return (
    <GeneralRenameDialog
      trigger={trigger}
      title={
        item.type === ContentType.file
          ? t('fileRenameContent.renameYourFile')
          : t('fileRenameContent.renameYourDirectory')
      }
      placeholder={t('fileRenameContent.placeholder')}
      isValidInput={isValidInput}
      onSubmit={handleRename}
    />
  );
};

export default RenameItemDialog;
