import React, { useEffect, useState } from 'react';
import useFileEditorStore from '@/store/fileEditorStore';
import { DocumentEditor } from '@onlyoffice/document-editor-react';
import { getFileNameFromPath, getFileType } from '@/pages/FileSharing/utilities/fileManagerCommon';

const FileEditingPage = () => {
  const editableFiles = useFileEditorStore((state) => state.editableFiles);
  const [token, setToken] = useState('null');
  const file = editableFiles[0];

  if (file) {
    const key = `docx-${Math.random()}`;
    const config = {
      document: {
        fileType: getFileType(file.filename),
        key,
        download: true,
        title: file.filename,
        height: '100%',
        width: '100%',
        url: `http://host.docker.internal:3001/file/open${file.filename}/${getFileNameFromPath(file.filename)}`,
      },
      documentType: 'word',
      token,
    };

    useEffect(() => {
      console.log(file.filename, 'document is being loaded');
      const fetchToken = async () => {
        try {
          const response = await fetch('http://localhost:3001/documents/generate-jwt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
          });
          const data = (await response.json()) as { jwt: string };
          setToken(data.jwt);
        } catch (error) {
          console.error('Failed to fetch token:', error);
        }
      };

      fetchToken().catch(console.error);
    }, []);

    const onDocumentReady = () => {
      console.log('Document is loaded');
    };

    const onLoadComponentError = (errorCode: number, errorDescription: string) => {
      switch (errorCode) {
        case -1:
          console.log(errorDescription);
          break;
        case -2:
          console.log(errorDescription);
          break;
        case -3:
          console.log(errorDescription);
          break;
        default:
      }
    };

    return token ? (
      <div className="h-full w-full">
        <DocumentEditor
          id="docxEditor"
          documentServerUrl="http://localhost:80/"
          config={config}
          events_onDocumentReady={onDocumentReady}
          onLoadComponentError={onLoadComponentError}
        />
      </div>
    ) : (
      <div>Loading...</div>
    );
  }

  return <div>File not found</div>;
};

export default FileEditingPage;
