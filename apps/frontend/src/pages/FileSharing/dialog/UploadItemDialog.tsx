import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/shared/Button';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import useFileManagerStore from '@/store/fileManagerStore';
import { DropZone, FileWithPreview } from '@/pages/FileSharing/utilities/DropZone';
import useMediaQuery from '@/hooks/media/useMediaQuery';

interface UploadItemDialogProps {
  trigger: React.ReactNode;
}

const UploadItemDialog: React.FC<UploadItemDialogProps> = ({ trigger }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const currentPath = useFileManagerStore((state) => state.currentPath);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const setFileOperationSuccessful = useFileManagerStore((state) => state.setFileOperationSuccessful);
  const setProgress = useFileManagerStore((state) => state.setUploadProgress);
  const resetProgress = useFileManagerStore((state) => state.resetProgress);

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
      setFileOperationSuccessful(true, 'Files uploaded successfully');
      resetProgress();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setFileOperationSuccessful(false, errorMessage);
      resetProgress();
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
            Upload: {selectedFiles.length} items
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
          <SheetTitle>Upload Your Item</SheetTitle>
        </SheetHeader>
        {uploadContent}
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Upload Your Item</DialogTitle>
        {uploadContent}
      </DialogContent>
    </Dialog>
  );
};

export default UploadItemDialog;
