import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import React, { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import DirectoryCreationForm from '@/pages/FileSharing/form/DirectoryCreationForm';
import FileCreationForm from '@/pages/FileSharing/form/FileCreationForm';
import useFileManagerStore from '@/store/fileManagerStore';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import { ContentType } from '@/datatypes/filesystem';
import { useTranslation } from 'react-i18next';

interface CreateNewContentDialogProps {
  trigger: ReactNode;
  contentType: ContentType;
}

const CreateNewContentDialog: React.FC<CreateNewContentDialogProps> = ({ trigger, contentType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const {
    fileName,
    setFileName,
    directoryName,
    setDirectoryName,
    currentPath,
    setFileOperationSuccessful,
    fetchFiles,
    handleWebDavAction,
  } = useFileManagerStore();

  const createFile = async (path: string): Promise<void> => {
    await handleWebDavAction(() => WebDavFunctions.createFile(`${currentPath}/${path}`))
      .then(async (resp) => {
        if ('message' in resp) {
          setFileOperationSuccessful(resp.success, t('fileCreateNewContent.fileOperationSuccessful'));
        } else {
          setFileOperationSuccessful(resp.success, t('fileCreateNewContent.noMessageAvailable'));
        }
        await fetchFiles(currentPath);
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : t('fileCreateNewContent.unknownErrorOccurred');
        setFileOperationSuccessful(false, errorMessage);
      });
  };

  const createDirectory = async (path: string): Promise<void> => {
    await handleWebDavAction(() => WebDavFunctions.createDirectory(`${currentPath}/${path}`))
      .then(async (resp) => {
        if ('message' in resp) {
          setFileOperationSuccessful(resp.success, t('fileCreateNewContent.fileOperationSuccessful'));
        } else {
          setFileOperationSuccessful(resp.success, t('fileCreateNewContent.noMessageAvailable'));
        }
        await fetchFiles(currentPath);
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : t('fileCreateNewContent.unknownErrorOccurred');
        setFileOperationSuccessful(false, errorMessage);
      });
  };

  const handleCreateContent = async () => {
    if (contentType === ContentType.file) {
      await createFile(fileName);
    } else {
      await createDirectory(directoryName);
    }
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setDirectoryName('');
      setFileName('');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          {contentType === ContentType.file ? (
            <>
              <DialogTitle>{t('fileCreateNewContent.fileDialogTitle')}</DialogTitle>
              <DialogDescription>
                <FileCreationForm />
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>{t('fileCreateNewContent.directoryDialogTitle')}</DialogTitle>
              <DialogDescription>
                <DirectoryCreationForm />
              </DialogDescription>
            </>
          )}
          <div className="container mx-auto flex justify-end p-4">
            <Button
              className="w-1/4 rounded bg-blue-500 px-4 py-2 text-white"
              disabled={directoryName.length <= 0 && fileName.length <= 0}
              onClick={() => {
                handleCreateContent().catch(() => null);
              }}
            >
              {t('fileCreateNewContent.createButtonText')}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewContentDialog;
