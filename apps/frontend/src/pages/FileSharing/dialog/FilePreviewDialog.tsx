import React, { FC } from 'react';
import { DirectoryFile } from '@/datatypes/filesystem';
import { DialogSH, DialogContentSH } from '@/components/ui/DialogSH.tsx';
import Label from '@/components/ui/Label';
import { getFileType } from '@/pages/FileSharing/utilities/fileManagerCommon';
import fileTypePreviews from '@/pages/FileSharing/previews/FileTypePreviews';
import { FileTypePreviewProps } from '@/datatypes/types';

interface FilePreviewProps {
  file: DirectoryFile;
  isOpen: boolean;
  onClose: () => void;
}

const DefaultPreview: React.FC<FileTypePreviewProps> = ({ file }) => (
  <>
    <p>Unsupported file type: {getFileType(file.filename)}</p>
    <Label>File</Label>
  </>
);

const renderTypeSpecificPreview: React.FC<FileTypePreviewProps> = ({ file }) => {
  const FileTypeComponent = fileTypePreviews[getFileType(file.filename)] || DefaultPreview;
  return <FileTypeComponent file={file} />;
};

const FilePreviewDialog: FC<FilePreviewProps> = ({ file, isOpen, onClose }) => {
  const handleOpenChange = () => {
    onClose();
  };
  return (
    <div className="container w-full">
      <DialogSH
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        <DialogContentSH>{renderTypeSpecificPreview({ file })}</DialogContentSH>
      </DialogSH>
    </div>
  );
};

export default FilePreviewDialog;
