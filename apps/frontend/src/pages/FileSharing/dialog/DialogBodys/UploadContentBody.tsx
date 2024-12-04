import DropZone from '@/pages/FileSharing/utilities/DropZone';
import React from 'react';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/useFileSharingDialogStore';

const UploadContentBody: React.FC = () => {
  const { filesToUpload, setFilesToUpload } = useFileSharingDialogStore();
  return (
    <DropZone
      files={filesToUpload || []}
      setFiles={setFilesToUpload}
    />
  );
};

export default UploadContentBody;
