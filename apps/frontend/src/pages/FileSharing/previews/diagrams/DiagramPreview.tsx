import React, { FC, useEffect, useRef, useState } from 'react';
import { DirectoryFile } from '@/datatypes/filesystem.ts';
import { DrawIoEmbed } from 'react-drawio';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore.ts';
import PreviewMenuBar from '@/pages/FileSharing/previews/documents/PreviewMenuBar.tsx';
import useFileEditorStore from '@/pages/FileSharing/previews/documents/fileEditorStore.ts'; // Make sure to import DrawIoEmbed correctly

interface DiagramPreviewProps {
  file: DirectoryFile;
  onClose: () => void;
  isPreview: boolean;
}

const DiagramPreview: FC<DiagramPreviewProps> = ({ file, onClose, isPreview }) => {
  const drawioRef = useRef<any>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const { downloadFile } = useFileManagerStore();
  const { appendEditorFile } = useFileEditorStore();

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        console.log('Fetching file content', file.filename);
        const rawUrl = await downloadFile(file.filename);
        const response = await fetch(rawUrl);
        const text = await response.text();
        setFileContent(text);
      } catch (error) {
        console.error('Failed to fetch file content', error);
      }
    };
    fetchFileContent();
  }, [file]);

  useEffect(() => {
    if (fileContent && drawioRef.current) {
      drawioRef.current.load({ xml: fileContent });
    }
  }, [fileContent]);

  return (
    <div>
      {isPreview && (
        <PreviewMenuBar
          file={file}
          previewFile={file}
          onClose={onClose}
          appendEditorFile={appendEditorFile}
        />
      )}
      {isPreview && <p>{file.basename}</p>}
      {fileContent && (
        <div className={!isPreview ? 'pr-15 h-screen w-screen object-cover' : 'h-full max-h-[75vh] ' + ' object-cover'}>
          <DrawIoEmbed
            ref={drawioRef}
            xml={fileContent}
            onSave={(newXml) => {
              console.log('Diagram content changed', newXml);
            }}
            onClose={() => {
              console.log('Diagram editor closed');
            }}
            configuration={{
              height: '100%',
              width: '100%',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DiagramPreview;
