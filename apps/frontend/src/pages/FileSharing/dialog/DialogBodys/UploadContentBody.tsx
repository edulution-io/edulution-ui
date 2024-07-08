import DropZone from '@/pages/FileSharing/utilities/DropZone';
import React from 'react';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';

export interface UploadContentBodyProps {}

const UploadContentBody: React.FC<UploadContentBodyProps> = () => {
  const { filesToUpload, setFilesToUpload } = useFileSharingDialogStore();
  return (
    <DropZone
      files={filesToUpload || []}
      setFiles={setFilesToUpload}
    />
  );
};

export default UploadContentBody;
