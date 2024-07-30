import DropZone from '@/pages/FileSharing/utilities/DropZone';
import React from 'react';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import EmptyDialogProps from '@libs/filesharing/types/filesharingEmptyProps';

const UploadContentBody: React.FC<EmptyDialogProps> = () => {
  const { filesToUpload, setFilesToUpload } = useFileSharingDialogStore();
  return (
    <DropZone
      files={filesToUpload || []}
      setFiles={setFilesToUpload}
    />
  );
};

export default UploadContentBody;
