import React from 'react';
import { FileIcon } from 'react-file-icon';
import { getFileCategorie } from '@/pages/FileSharing/utilities/fileManagerUtilits';
import { getFileNameFromPath } from '@/pages/FileSharing/utilities/fileManagerCommon';
import fileIconColors from '@/theme/fileIconColor';

interface FileIconComponentProps {
  filename: string;
}

const FileIconComponent: React.FC<FileIconComponentProps> = ({ filename }) => {
  const fileType = getFileCategorie(filename);

  const labelColor = fileIconColors[fileType] || fileIconColors.default;

  return (
    <FileIcon
      extension={getFileNameFromPath(filename).split('.').pop() || ''}
      type={fileType !== undefined ? fileType : 'document'}
      labelColor={labelColor}
    />
  );
};

export default FileIconComponent;
