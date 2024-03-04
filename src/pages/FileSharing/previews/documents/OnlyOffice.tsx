import React from 'react';
import { DocumentEditor } from '@onlyoffice/document-editor-react';

const OnlyOffice = ({ documentType = '', fileType = '', title = '', documentUrl = '', key = '', callbackUrl = '' }) => {
  const onDocumentReady = () => {
    console.log('Document is loaded');
  };

  const onLoadComponentError = (errorCode: number, errorDescription: string) => {
    console.error(`Error Code: ${errorCode}, Description: ${errorDescription}`);
  };

  return (
    <DocumentEditor
      id="docxEditor"
      documentServerUrl={import.meta.env.VITE_DOCUMENT_SERVER_URL as string}
      config={{
        document: {
          fileType,
          key,
          title,
          url: documentUrl,
        },
        documentType,
        editorConfig: {
          callbackUrl,
        },
      }}
      events_onDocumentReady={onDocumentReady}
      onLoadComponentError={onLoadComponentError}
    />
  );
};

export default OnlyOffice;
