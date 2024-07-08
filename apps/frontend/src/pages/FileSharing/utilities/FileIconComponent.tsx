import React from 'react';
import { FileIcon } from 'react-file-icon';
import { getFileCategorie } from '@/pages/FileSharing/utilities/fileManagerUtilits';
import fileIconColors from '@/theme/fileIconColor';
import { getFileNameFromPath } from '@/pages/FileSharing/utilities/fileManagerCommon';

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
        type={fileType !== undefined ? fileType : 'document'}
        labelColor={labelColor}
      />
    </div>
  );
};

export default FileIconComponent;
