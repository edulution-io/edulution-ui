import React from 'react';
import { FileIcon } from 'react-file-icon';
import getFileCategorie from '@/pages/FileSharing/utilities/fileManagerUtilits';
import { getFileNameFromPath } from '@/utils/common';

interface FileIconComponentProps {
  filename: string;
}

const FileIconComponent: React.FC<FileIconComponentProps> = ({ filename }) => {
  const fileType = getFileCategorie(filename);

  return (
    <FileIcon
      extension={getFileNameFromPath(filename).split('.').pop() || ''}
      type={fileType !== undefined ? fileType : 'document'}
      labelColor="green"
    />
  );
};

export default FileIconComponent;
