import React, { FC, useEffect, useState } from 'react';
import { DirectoryFile } from '@/datatypes/filesystem';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import { convertDownloadLinkToBlob } from '@/pages/FileSharing/previews/utilitys/utilitys.ts';
import PreviewMenuBar from '@/pages/FileSharing/previews/documents/PreviewMenuBar.tsx';
import useFileEditorStore from '@/pages/FileSharing/previews/documents/fileEditorStore.ts';

interface GraphicPreviewProps {
  file: DirectoryFile;
  onClose: () => void;
  isPreview?: boolean;
}
interface ImageProps {
  url: string;
  description: string;
  isPreview: boolean;
}

const Image: FC<ImageProps> = ({ url, description, isPreview }) => {
  return (
    <img
      src={url}
      alt={description}
      className={
        !isPreview ? 'max-h-[80vh] max-w-[80vw] object-contain' : 'h-full max-h-[75vh] w-full max-w-[75vw] object-cover'
      }
      onError={(e) => {
        console.error('Error loading image:', e, 'URL:', url);
        (e.target as HTMLImageElement).src = '';
      }}
    />
  );
};

const GraphicPreview: React.FC<GraphicPreviewProps> = ({ file, onClose, isPreview }) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const { appendEditorFile } = useFileEditorStore();
  const { downloadFile } = useFileManagerStore();

  useEffect(() => {
    const fetchFileUrl = async () => {
      try {
        const rawUrl = await downloadFile(file.filename);
        const blobUrl = await convertDownloadLinkToBlob(rawUrl);
        setFileUrl(blobUrl);
      } catch (error) {
        console.error('Error fetching file URL:', error);
      }
    };
    fetchFileUrl();
  }, [file.filename, downloadFile]);

  return (
    <>
      {isPreview && (
        <PreviewMenuBar
          file={file}
          previewFile={file}
          onClose={onClose}
          appendEditorFile={appendEditorFile}
        />
      )}
      {fileUrl ? (
        <div>
          {isPreview && <p>{file.basename}</p>}
          <Image
            url={fileUrl}
            description={`Preview of ${file.filename}`}
            isPreview={isPreview || false}
          />
        </div>
      ) : (
        <p>Loading image...</p>
      )}
    </>
  );
};

export default GraphicPreview;
