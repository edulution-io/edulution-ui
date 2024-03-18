import React, { FC, useState } from 'react';
import ReactPlayer from 'react-player';
import { FileTypePreviewProps } from '@/datatypes/types';

const MediaPreview: FC<FileTypePreviewProps> = ({ file }) => {
  const [playing, setPlaying] = useState(false);
  const mediaUrl = `webdav/${file.filename}`;

  const startPlaying = () => {
    setPlaying(true);
  };

  return (
    <div className="relative rounded-lg bg-white shadow-lg">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="text-lg font-semibold">Media Preview</h3>
      </div>
      <div className="relative pt-[56.25%]">
        <ReactPlayer
          url={mediaUrl}
          playing={playing}
          controls
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          onReady={startPlaying}
        />
      </div>
      <div className="p-4">
        <span className="block text-sm font-medium text-gray-800">File Name: {file.filename}</span>
      </div>
    </div>
  );
};

export default MediaPreview;
