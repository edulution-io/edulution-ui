import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/shared/Button';
import WebDavFileManager from '@/webdavclient/WebDavFileManager';
import { useFileManagerStore } from '@/store/appDataStore';
import { DropZone, FileWithPreview } from '@/pages/FileSharing/utilities/DropZone';

interface UploadItemDialogProps {
  trigger: React.ReactNode;
}

const UploadItemDialog: React.FC<UploadItemDialogProps> = ({ trigger }) => {
  const currentPath = useFileManagerStore((state) => state.currentPath);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const webDavFileManager = new WebDavFileManager();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedFiles([]);
    }
  };

  const uploadFiles = async () => {
    const uploadPromises = selectedFiles.map((file) => {
      const remotePath = `${currentPath}/${file.name}`;
      return webDavFileManager.uploadFile(file, remotePath);
    });

    try {
      await Promise.all(uploadPromises);
      setIsOpen(false);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Some files failed to upload', error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Upload Your Item</DialogTitle>
        <DropZone
          files={selectedFiles}
          setFiles={setSelectedFiles}
        />
        {selectedFiles.length === 0 ? (
          <Button disabled={selectedFiles.length > 5 || selectedFiles.length === 0}>Select upto 5 items a time</Button>
        ) : (
          <Button
            disabled={selectedFiles.length > 5 || selectedFiles.length === 0}
            onClick={() => {
              uploadFiles().catch((error) => console.error('Failed to upload files', error));
            }}
          >
            Upload: {selectedFiles.length} items
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadItemDialog;
