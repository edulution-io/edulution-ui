import {
  DialogSH,
  DialogContentSH,
  DialogHeaderSH,
  DialogTitleSH,
  DialogTriggerSH,
} from '@/components/ui/DialogSH.tsx';
import React, { ReactNode, useState } from 'react';
import DirectoryCreationForm from '@/pages/FileSharing/form/DirectoryCreationForm';
import FileCreationForm from '@/pages/FileSharing/form/FileCreationForm';
import useFileManagerStore from '@/store/fileManagerStore';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import { ContentType } from '@/datatypes/filesystem';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { Button } from '@/components/shared/Button';
import { useMediaQuery } from 'usehooks-ts';

interface CreateNewContentDialogProps {
  trigger: ReactNode;
  contentType: ContentType;
}

const CreateNewContentDialog: React.FC<CreateNewContentDialogProps> = ({ trigger, contentType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');
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

  const mobileContent = (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="flex flex-col"
      >
        <SheetHeader>
          {contentType === ContentType.file ? (
            <>
              <SheetTitle>{t('fileCreateNewContent.fileDialogTitle')}</SheetTitle>
              <SheetDescription>
                <FileCreationForm />
              </SheetDescription>
            </>
          ) : (
            <>
              <SheetTitle>{t('fileCreateNewContent.directoryDialogTitle')}</SheetTitle>
              <SheetDescription>
                <DirectoryCreationForm />
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        <div className="mt-4 flex justify-end px-6">
          <Button
            variant="btn-collaboration"
            disabled={directoryName.length <= 0 && fileName.length <= 0}
            onClick={() => {
              handleCreateContent().catch(() => null);
            }}
          >
            {t('fileCreateNewContent.createButtonText')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
  const desktopContent = (
    <DialogHeaderSH>
      {contentType === ContentType.file ? (
        <>
          <DialogTitleSH>{t('fileCreateNewContent.fileDialogTitle')}</DialogTitleSH>

          <FileCreationForm />
        </>
      ) : (
        <>
          <DialogTitleSH>{t('fileCreateNewContent.directoryDialogTitle')}</DialogTitleSH>

          <DirectoryCreationForm />
        </>
      )}
      <div className="container mx-auto flex justify-end p-4">
        <Button
          variant="btn-collaboration"
          disabled={directoryName.length <= 0 && fileName.length <= 0}
          onClick={() => {
            handleCreateContent().catch(() => null);
          }}
        >
          {t('fileCreateNewContent.createButtonText')}
        </Button>
      </div>
    </DialogHeaderSH>
  );

  return isMobile ? (
    mobileContent
  ) : (
    <DialogSH
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTriggerSH asChild>{trigger}</DialogTriggerSH>
      <DialogContentSH>{desktopContent}</DialogContentSH>
    </DialogSH>
  );
};

export default CreateNewContentDialog;
