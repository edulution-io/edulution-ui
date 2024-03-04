import React from 'react';
import { DocumentEditor } from '@onlyoffice/document-editor-react';
import { getFileTyp } from '@/utils/common';
import { FileTypePreviewProps } from '@/datatypes/types';

interface OnlyOfficeProps extends FileTypePreviewProps {
  callbackUrl?: string;
}

const onDocumentReady = () => {
  console.log('Document is loaded');
};

const onLoadComponentError = (errorCode: number, errorDescription: string) => {
  console.error(`Error Code: ${errorCode}, Description: ${errorDescription}`);
};

const OnlyOffice: React.FC<OnlyOfficeProps> = ({ file, callbackUrl = '' }) => {
  const documentUrl = `http://localhost:5173/webdav/${file.filename}`;
  const title = file.filename;
  const fileType = getFileTyp(file.filename);
  const key = encodeURIComponent(file.filename);
  let documentType;
  switch (fileType) {
    case 'docx':
      documentType = 'word';
      break;
    case 'xlsx':
      documentType = 'cell';
      break;
    case 'pptx':
      documentType = 'slide';
      break;
    default:
      documentType = 'word'; // Default or throw an error based on your use case
  }

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

OnlyOffice.defaultProps = {
  callbackUrl: '',
};

export default OnlyOffice;
