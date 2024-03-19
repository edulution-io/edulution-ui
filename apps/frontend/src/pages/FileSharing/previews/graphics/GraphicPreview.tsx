import React from 'react';
import { DirectoryFile } from '@/datatypes/filesystem';
import { getFileNameFromPath } from '@/utils/common';

interface GraphicPreviewProps {
  file: DirectoryFile;
}

const GraphicPreview: React.FC<GraphicPreviewProps> = ({ file }) => {
  const mediaUrl = `/webdav${file.filename}`;

  return (
    <>
      <h1>Graphic Preview for: {getFileNameFromPath(file.filename)}</h1>
      <img
        src={mediaUrl}
        alt={`Preview of ${file.filename}`}
      />
    </>
  );
};

export default GraphicPreview;
