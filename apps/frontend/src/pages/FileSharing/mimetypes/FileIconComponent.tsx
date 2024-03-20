import React from 'react';
import { FileIcon } from 'react-file-icon';
import { getFileCategorie } from '@/pages/FileSharing/utilities/fileManagerUtilits';
import { getFileNameFromPath } from '@/utils/common';

interface FileIconComponentProps {
  filename: string;
}

const FileIconComponent: React.FC<FileIconComponentProps> = ({ filename }) => {
  const fileType = getFileCategorie(filename);

  function getLabelColor() {
    switch (fileType) {
      case 'document':
        return 'green';
      case 'image':
        return 'yellow';
      case 'audio':
        return 'blue';
      case 'video':
        return 'red';
      case 'code':
        return 'purple';
      case 'acrobat':
        return 'pink';
      default:
        return 'gray';
    }
  }

  return (
    <FileIcon
      extension={getFileNameFromPath(filename).split('.').pop() || ''}
      type={fileType !== undefined ? fileType : 'document'}
      labelColor={getLabelColor()}
    />
  );
};

export default FileIconComponent;
