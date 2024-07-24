import React from 'react';
import { FileIcon } from 'react-file-icon';
import { getFileCategorie, getFileNameFromPath } from '@/pages/FileSharing/utilities/filesharingUtilities';
import fileIconColors from '@/theme/fileIconColor';

interface FileIconComponentProps {
  filename: string;
  size: number;
}

const FileIconComponent: React.FC<FileIconComponentProps> = ({ filename, size }) => {
  const fileType = getFileCategorie(filename);
  const extension = getFileNameFromPath(filename).split('.').pop() || '';
  const labelColor = fileIconColors[fileType] || fileIconColors.default;

  return (
    <div style={{ width: size, height: size, display: 'flex' }}>
      <FileIcon
        extension={extension}
        type={fileType || 'document'}
        labelColor={labelColor}
      />
    </div>
  );
};

export default FileIconComponent;
