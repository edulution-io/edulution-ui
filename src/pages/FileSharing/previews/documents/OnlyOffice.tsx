import React from 'react';
import { FileTypePreviewProps } from '@/datatypes/types';

interface OnlyOfficeProps extends FileTypePreviewProps {
  callbackUrl?: string;
}

// const onDocumentReady = () => {
//   console.log('Document is loaded');
// };
//
// const onLoadComponentError = (errorCode: number, errorDescription: string) => {
//   console.error(`Error Code: ${errorCode}, Description: ${errorDescription}`);
// };
//
const OnlyOffice: React.FC<OnlyOfficeProps> = ({ file, callbackUrl = '' }) => (
  //   const documentUrl = `http://192.168.0.1:5173/webdav${file.filename}`;
  //   const title = getFileNameFromPath(file.filename);
  //   const fileType = getFileTyp(file.filename);
  //   const key = encodeURIComponent(file.filename);
  //   let documentType;
  //   switch (fileType) {
  //     case 'docx':
  //       documentType = 'word';
  //       break;
  //     case 'xlsx':
  //       documentType = 'cell';
  //       break;
  //     case 'pptx':
  //       documentType = 'slide';
  //       break;
  //     default:
  //       documentType = 'word';
  //   }

  <h1>
    OnlyOffice will be a feature which will be available soon: ${file.filename} ${callbackUrl}
  </h1>
  // <div className="h-full w-full">
  //   <DocumentEditor
  //     id="docxEditor"
  //     documentServerUrl={import.meta.env.VITE_DOCUMENT_SERVER_URL as string}
  //     config={{
  //       document: {
  //         fileType,
  //         key,
  //         title,
  //
  //         url: documentUrl,
  //       },
  //       documentType,
  //
  //       editorConfig: {
  //         callbackUrl,
  //       },
  //     }}
  //     events_onInfo={() => console.log('Info')}
  //     events_onError={() => console.log('Error')}
  //     events_onDocumentReady={onDocumentReady}
  //     onLoadComponentError={onLoadComponentError}
  //   />
  // </div>
);
OnlyOffice.defaultProps = {
  callbackUrl: 'http://192.168.0.1/file-sharing:5173',
};

export default OnlyOffice;
