import { DocumentEditor } from '@onlyoffice/document-editor-react';
import React, { FC, useCallback } from 'react';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import { useTranslation } from 'react-i18next';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';
import { useSearchParams } from 'react-router-dom';

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
  const { isFullScreenEditingEnabled } = useFileSharingStore();
  const { deleteFileAfterEdit } = useFileEditorStore();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const handleDocumentReady = useCallback(() => {
    void deleteFileAfterEdit(editorConfig.document.url);
  }, [mode, fileName, filePath]);

  const validateConfig = (config: OnlyOfficeEditorConfig) =>
    !(!config.document || !config.document.url || !config.editorConfig.callbackUrl);

  const handleLoadComponentError = (errorCode: number) => {
    switch (errorCode) {
      default:
        void deleteFileAfterEdit(editorConfig.document.url);
    }
  };

  const isOpenedInNewTab = Boolean(searchParams.get('tab'));

  let className = 'h-[75vh]';
  if (isFullScreenEditingEnabled) {
    className = 'h-full';
  } else if (isOpenedInNewTab) {
    className = 'h-screen';
  }

  return (
    <div className={`relative ${className}`}>
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
