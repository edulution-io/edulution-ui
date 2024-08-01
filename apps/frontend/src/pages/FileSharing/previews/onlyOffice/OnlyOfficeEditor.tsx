import { DocumentEditor } from '@onlyoffice/document-editor-react';
import React, { FC, useCallback } from 'react';
import OnlyOfficeEditorConfig from '@/pages/FileSharing/previews/onlyOffice/OnlyOfficeEditorConfig';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';

interface OnlyOfficeEditorProps {
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
    <div className={mode === 'view' ? 'relative h-[75vh]' : 'relative h-[95vh]'}>
      {editorType ? (
        <DocumentEditor
          key={editorType.key}
          id={editorType.id}
          documentServerUrl={documentServerURL}
          config={editorConfig}
          events_onDocumentReady={handleDocumentReady}
          onLoadComponentError={handleLoadComponentError}
        />
      ) : (
        <div>Loading document...</div>
      )}
    </div>
  );
};

export default OnlyOfficeEditor;
