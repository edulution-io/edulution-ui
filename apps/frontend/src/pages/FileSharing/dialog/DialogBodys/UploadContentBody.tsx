import DropZone from '@/pages/FileSharing/utilities/DropZone';
import React from 'react';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import EmptyDialogProps from '@libs/ui/types/filesharing/FilesharingEmptyProps';

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
