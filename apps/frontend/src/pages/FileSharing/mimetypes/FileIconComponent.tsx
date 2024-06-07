import React from 'react';
import { FileIcon } from 'react-file-icon';
import { getFileCategorie } from '@/pages/FileSharing/utilities/fileManagerUtilits';
import { getFileNameFromPath } from '@/pages/FileSharing/utilities/fileManagerCommon';
import fileIconColors from '@/theme/fileIconColor';

interface FileIconComponentProps {
  filename: string;
  size?: number; // Optional size prop
}

const FileIconComponent: React.FC<FileIconComponentProps> = ({ filename, size }) => {
  const fileType = getFileCategorie(filename);
  const labelColor = fileIconColors[fileType] || fileIconColors.default;
  const extension = getFileNameFromPath(filename).split('.').pop() || '';

  return (
    <div style={{ width: size, height: size }}>
      <FileIcon
        extension={extension}
        type={fileType !== undefined ? fileType : 'document'}
        labelColor={labelColor}
      />
    </div>
  );
};

export default FileIconComponent;
