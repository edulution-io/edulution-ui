import React from 'react';
import { DirectoryFile } from '@/datatypes/filesystem';
import { getFileNameFromPath } from '@/utils/common';

interface GraphicPreviewProps {
  file: DirectoryFile;
}

const GraphicPreview: React.FC<GraphicPreviewProps> = ({ file }) => {
  const mediaUrl = `http://localhost:5173/webdav/${file.filename}`;

  return (
    <div>
      <h1>Graphic Preview for: {getFileNameFromPath(file.filename)}</h1>
      <img
        src={mediaUrl}
        alt={`Preview of ${file.filename}`}
      />
    </div>
  );
};

export default GraphicPreview;
