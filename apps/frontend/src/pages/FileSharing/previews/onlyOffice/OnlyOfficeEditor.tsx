import { DocumentEditor } from '@onlyoffice/document-editor-react';
import React, { FC, useCallback } from 'react';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import { useTranslation } from 'react-i18next';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';

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
  const { deleteFileAfterEdit } = useFileEditorStore();
  const { t } = useTranslation();
  const handleDocumentReady = useCallback(() => {
    void deleteFileAfterEdit(editorConfig.document.url);
  }, [mode, fileName, filePath, setCurrentlyEditingFile]);

  const validateConfig = (config: OnlyOfficeEditorConfig) =>
    !(!config.document || !config.document.url || !config.editorConfig.callbackUrl);

  const handleLoadComponentError = (errorCode: number) => {
    switch (errorCode) {
      default:
        void deleteFileAfterEdit(editorConfig.document.url);
    }
  };

  return (
    <div className={mode === 'view' ? 'relative h-[75vh]' : 'relative h-[95vh]'}>
      {editorType && validateConfig(editorConfig) ? (
        <DocumentEditor
          key={editorType.key}
          id={editorType.id}
          documentServerUrl={documentServerURL}
          config={editorConfig}
          events_onDocumentReady={handleDocumentReady}
          onLoadComponentError={handleLoadComponentError}
        />
      ) : (
        <div>{t('filesharing.loadingDocument')}</div>
      )}
    </div>
  );
};

export default OnlyOfficeEditor;
