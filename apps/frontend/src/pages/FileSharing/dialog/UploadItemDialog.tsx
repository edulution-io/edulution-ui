import React, { useState } from 'react';
import { DialogSH, DialogContentSH, DialogTitleSH, DialogTriggerSH } from '@/components/ui/DialogSH.tsx';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { Button } from '@/components/shared/Button';
import { DropZone, FileWithPreview } from '@/pages/FileSharing/utilities/DropZone';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'usehooks-ts';
import { useSearchParams } from 'react-router-dom';
import useFileManagerStore from '@/store/fileManagerStore';

interface UploadItemDialogProps {
  trigger: React.ReactNode;
}

const UploadItemDialog: React.FC<UploadItemDialogProps> = ({ trigger }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path');
  const { t } = useTranslation();
  const { handleWebDavAction, uploadFile, setFileOperationSuccessful } = useFileManagerStore();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedFiles([]);
    }
  };

  const uploadMultipleFiles = async (files: File[], path: string): Promise<boolean[]> => {
    const uploadPromises = files.map(async (file) => {
      const result = await handleWebDavAction(() => uploadFile(file, path));
      return result.success;
    });
    return Promise.all(uploadPromises);
  };

  const uploadFiles = async () => {
    setIsOpen(false);
    try {
      const resp = await uploadMultipleFiles(selectedFiles, path || '/');
      const allSuccess = resp.every((success) => success);
      if (allSuccess) {
        await setFileOperationSuccessful(true, t('fileCreateNewContent.fileOperationSuccessful'));
      } else {
        await setFileOperationSuccessful(false, t('fileCreateNewContent.unknownErrorOccurred'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      await setFileOperationSuccessful(false, errorMessage);
    } finally {
      setSelectedFiles([]);
    }
  };

  const uploadContent = (
    <>
      <DropZone
        files={selectedFiles}
        setFiles={setSelectedFiles}
      />
      {selectedFiles.length === 0 ? (
        <Button disabled>Select up to 5 items at a time</Button>
      ) : (
        <div className="mt-4 flex justify-end px-6">
          <Button
            variant="btn-collaboration"
            disabled={selectedFiles.length > 5}
            onClick={() => {
              uploadFiles().catch((error) => {
                console.error(error);
              });
            }}
          >
            {t('filesharingUpload.uploadItems', { count: selectedFiles.length })}
          </Button>
        </div>
      )}
    </>
  );

  return isMobile ? (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>{t('filesharingUpload.title')}</SheetTitle>
        </SheetHeader>
        {uploadContent}
      </SheetContent>
    </Sheet>
  ) : (
    <DialogSH
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTriggerSH asChild>{trigger}</DialogTriggerSH>
      <DialogContentSH>
        <DialogTitleSH>{t(`filesharingUpload.title`)}</DialogTitleSH>
        {uploadContent}
      </DialogContentSH>
    </DialogSH>
  );
};

export default UploadItemDialog;
