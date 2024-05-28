import React, { FC, useEffect, useState } from 'react';
import FilePlayer from 'react-player';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import { convertDownloadLinkToBlob } from '@/pages/FileSharing/previews/utilitys/utilitys.ts';
import PreviewMenuBar from '@/pages/FileSharing/previews/documents/PreviewMenuBar.tsx';
import useFileEditorStore from '@/pages/FileSharing/previews/documents/fileEditorStore.ts';
import { DirectoryFile } from '@/datatypes/filesystem.ts';

interface MediaPreviewProps {
  file: DirectoryFile;
  onClose: () => void;
  isPreview?: boolean;
}

const MediaPreview: FC<MediaPreviewProps> = ({ file, onClose, isPreview }) => {
  const [playing, setPlaying] = useState(false);
  const { appendEditorFile } = useFileEditorStore();
  const [fileUrl, setFileUrl] = useState<string>('');
  const { downloadFile } = useFileManagerStore();

  useEffect(() => {
    const fetchFileUrl = async () => {
      try {
        const rawUrl = await downloadFile(file.filename);
        const blobUrl = await convertDownloadLinkToBlob(rawUrl);
        setFileUrl(blobUrl || '');
      } catch (error) {
        setFileUrl('');
        console.error('Error fetching file URL:', error);
      }
    };
    fetchFileUrl();
  }, [file.filename, downloadFile]);

  const startPlaying = () => {
    setPlaying(true);
  };

  return (
    <div className="relative rounded-lg bg-white shadow-lg">
      {isPreview && (
        <PreviewMenuBar
          file={file}
          previewFile={file}
          onClose={onClose}
          appendEditorFile={appendEditorFile}
        />
      )}
      <div className="relative pt-[56.25%]">
        <FilePlayer
          url={fileUrl}
          playing={playing}
          controls
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          onReady={startPlaying}
        />
      </div>
      <div className="p-4">
        {isPreview && <span className="block text-sm font-medium text-gray-800">{file.basename}</span>}
      </div>
    </div>
  );
};

export default MediaPreview;
