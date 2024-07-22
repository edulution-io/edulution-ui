import { DocumentEditor } from '@onlyoffice/document-editor-react';
import React, { FC, useCallback } from 'react';
import OnlyOfficeEditorConfig from '@/pages/FileSharing/previews/onlyOffice/OnlyOfficeEditorConfig';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';

interface OnlyOfficeEditorProps {
  isPreview?: boolean;
  editorType: {
    id: string;
    key: string;
    documentType: string;
  };
  mode: 'view' | 'edit';
  documentServerURL: string;
  editorConfig: OnlyOfficeEditorConfig;
  filePath: string;
  fileName: string;
}

const OnlyOfficeEditor: FC<OnlyOfficeEditorProps> = ({
  isPreview,
  fileName,
  filePath,
  mode,
  editorType,
  documentServerURL,
  editorConfig,
}) => {
  const { setCurrentlyEditingFile } = useFileSharingStore();

  const handleDocumentReady = useCallback(() => {}, [mode, fileName, filePath, setCurrentlyEditingFile]);

  const handleLoadComponentError = (errorCode: number) => {
    switch (errorCode) {
      case -1:
        console.error('Error: Document Server not available');
        break;
      case -2:
        console.error('Error: Invalid document key');
        break;
      case -3:
        console.error('Error: Unsupported document type');
        break;
      default:
        console.error(`Error: Unknown error code ${errorCode}`);
    }
  };

  return (
    <div className={`relative ${isPreview ? 'h-[75vh]' : 'h-[100vh]'}`}>
      <DocumentEditor
        key={editorType.key}
        id={editorType.id}
        documentServerUrl={documentServerURL}
        config={editorConfig}
        events_onDocumentReady={handleDocumentReady}
        onLoadComponentError={handleLoadComponentError}
      />
    </div>
  );
};

export default OnlyOfficeEditor;
