import { DocumentEditor } from '@onlyoffice/document-editor-react';
import React, { FC } from 'react';
import OnlyOfficeEditorConfig from '@/pages/FileSharing/previews/onlyOffice/OnlyOfficeEditorConfig';

interface OnlyOfficeEditorProps {
  isPreview?: boolean;
  editorType: {
    id: string;
    key: string;
    documentType: string;
  };
  documentServerURL: string;
  editorConfig: OnlyOfficeEditorConfig;
}

const onDocumentReady = () => {};

const onLoadComponentError = (errorCode: number) => {
  switch (errorCode) {
    case -1:
      break;

    case -2:
      break;

    case -3:
      break;
    default:
  }
};

const OnlyOfficeEditor: FC<OnlyOfficeEditorProps> = ({ isPreview, editorType, documentServerURL, editorConfig }) => (
  <div className={`relative ${isPreview ? 'h-[75vh]' : 'h-[100vh]'}`}>
    <DocumentEditor
      key={editorType.key}
      id={editorType.id}
      documentServerUrl={documentServerURL}
      config={editorConfig}
      events_onDocumentReady={onDocumentReady}
      onLoadComponentError={onLoadComponentError}
    />
  </div>
);

export default OnlyOfficeEditor;
