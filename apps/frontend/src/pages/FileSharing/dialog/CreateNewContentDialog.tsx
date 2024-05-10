import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import React, { ReactNode, useState } from 'react';
import DirectoryCreationForm from '@/pages/FileSharing/form/DirectoryCreationForm';
import FileCreationForm from '@/pages/FileSharing/form/FileCreationForm';
import useFileManagerStore from '@/store/fileManagerStore';
import { ContentType } from '@/datatypes/filesystem';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { Button } from '@/components/shared/Button';
import { useMediaQuery } from 'usehooks-ts';
import { useSearchParams } from 'react-router-dom';

interface CreateNewContentDialogProps {
  trigger: ReactNode;
  contentType: ContentType;
}

const CreateNewContentDialog: React.FC<CreateNewContentDialogProps> = ({ trigger, contentType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path');
  const { fileName, setFileName, directoryName, setDirectoryName, setFileOperationSuccessful, handleWebDavAction } =
    useFileManagerStore();

  const handelCreateResponse = async (
    resp: { success: boolean; message: string; status: number } | { success: boolean },
  ) => {
    if ('message' in resp) {
      console.log(resp.status);
      if (resp.status >= 200 && resp.status < 300) {
        await setFileOperationSuccessful(resp.success, t('fileCreateNewContent.fileOperationSuccessful'));
      } else if (resp.status >= 300) {
        await setFileOperationSuccessful(resp.success, t('fileCreateNewContent.unknownErrorOccurred'));
      }
    } else {
      await setFileOperationSuccessful(resp.success, t('fileCreateNewContent.noMessageAvailable'));
    }
  };

  const createFile = async (filename: string): Promise<void> => {
    if (!path) return;
    await handleWebDavAction(() => WebDavFunctions.createFile(path, filename))
      .then(async (resp) => {
        console.log(resp);
        await handelCreateResponse(resp);
      })
      .catch(async (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : t('fileCreateNewContent.unknownErrorOccurred');
        await setFileOperationSuccessful(false, errorMessage);
      });
  };

  const createDirectory = async (folderName: string): Promise<void> => {
    if (!path) return;
    await handleWebDavAction(() => WebDavFunctions.createDirectory(path, folderName))
      .then(async (resp) => {
        await handelCreateResponse(resp);
      })
      .catch(async (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : t('fileCreateNewContent.unknownErrorOccurred');
        await setFileOperationSuccessful(false, errorMessage);
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
    <DialogHeader>
      {contentType === ContentType.file ? (
        <>
          <DialogTitle>{t('fileCreateNewContent.fileDialogTitle')}</DialogTitle>

          <FileCreationForm />
        </>
      ) : (
        <>
          <DialogTitle>{t('fileCreateNewContent.directoryDialogTitle')}</DialogTitle>

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
    </DialogHeader>
  );

  return isMobile ? (
    mobileContent
  ) : (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>{desktopContent}</DialogContent>
    </Dialog>
  );
};

export default CreateNewContentDialog;
