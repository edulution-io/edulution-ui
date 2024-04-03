import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Button } from '@/components/shared/Button';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import useFileManagerStore from '@/store/fileManagerStore';
import { DropZone, FileWithPreview } from '@/pages/FileSharing/utilities/DropZone';
import { useTranslation } from 'react-i18next';

interface UploadItemDialogProps {
  trigger: React.ReactNode;
}

const UploadItemDialog: React.FC<UploadItemDialogProps> = ({ trigger }) => {
  const currentPath = useFileManagerStore((state) => state.currentPath);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const setFileOperationSuccessful = useFileManagerStore((state) => state.setFileOperationSuccessful);
  const setProgress = useFileManagerStore((state) => state.setUploadProgress);
  const resetProgress = useFileManagerStore((state) => state.resetProgress);
  const { t } = useTranslation();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedFiles([]);
    }
  };

  const handleProgressUpdate = (file: File, progress: number) => {
    setProgress(file.name, progress);
  };

  const uploadFiles = async () => {
    setIsOpen(false);
    try {
      await WebDavFunctions.uploadMultipleFiles(selectedFiles, currentPath, handleProgressUpdate);
      setFileOperationSuccessful(true, t('fileOperationSuccessful'));
      resetProgress();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('unknownErrorOccurred');
      setFileOperationSuccessful(false, errorMessage);
      resetProgress();
    } finally {
      setSelectedFiles([]);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>{t('fileSharingUpload.title')}</DialogTitle>
        <DropZone
          files={selectedFiles}
          setFiles={setSelectedFiles}
        />

        <Button
          className="bg-green-600"
          disabled={selectedFiles.length > 5 || selectedFiles.length === 0}
          onClick={() => {
            uploadFiles().catch((error) => console.error(t('uploadFailed'), error));
          }}
        >
          {t('fileSharingUpload.uploadItems', { count: selectedFiles.length })}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default UploadItemDialog;
