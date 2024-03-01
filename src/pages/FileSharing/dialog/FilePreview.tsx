import React, { FC } from 'react';
import { DirectoryFile } from '@/datatypes/filesystem';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Label from '@/components/ui/label';
import { getFileTyp } from '@/utils/common';
import fileTypePreviews from '@/pages/FileSharing/Previews/FileTypePreviews';
import { FileTypePreviewProps } from '@/datatypes/types';

interface FilePreviewProps {
  file: DirectoryFile;
  isOpen: boolean;
  onClose: () => void;
}

const DefaultPreview: React.FC<FileTypePreviewProps> = ({ file }) => (
  <div>
    <p>Unsupported file type: {getFileTyp(file.filename)}</p>
    <Label>File</Label>
  </div>
);

const renderTypeSpecificPreview: React.FC<FileTypePreviewProps> = ({ file }) => {
  const FileTypeComponent = fileTypePreviews[getFileTyp(file.filename)] || DefaultPreview;
  return <FileTypeComponent file={file} />;
};

const FilePreview: FC<FilePreviewProps> = ({ file, isOpen, onClose }) => {
  const handleOpenChange = () => {
    onClose();
  };
  return (
    <div className="h-full w-full">
      <Dialog
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        <DialogTrigger />
        <DialogContent>{renderTypeSpecificPreview({ file })}</DialogContent>
      </Dialog>
    </div>
  );
};

export default FilePreview;
