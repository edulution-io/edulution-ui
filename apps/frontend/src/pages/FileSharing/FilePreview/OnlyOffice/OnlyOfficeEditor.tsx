/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { DocumentEditor, IConfig } from '@onlyoffice/document-editor-react';
import React, { FC, useCallback } from 'react';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import { useTranslation } from 'react-i18next';

interface OnlyOfficeEditorProps {
  editorType: {
    id: string;
    key: string;
    documentType: string;
  };
  mode: 'view' | 'edit';
  documentServerURL: string;
  editorConfig: IConfig;
  filePath: string;
  fileName: string;
  isOpenedInNewTab?: boolean;
}

const OnlyOfficeEditor: FC<OnlyOfficeEditorProps> = ({
  fileName,
  filePath,
  mode,
  editorType,
  documentServerURL,
  editorConfig,
  isOpenedInNewTab,
}) => {
  const { deleteFileAfterEdit } = useFileEditorStore();
  const { t } = useTranslation();

  const handleDocumentReady = useCallback(() => {
    if (editorConfig.document?.url) {
      void deleteFileAfterEdit(editorConfig.document.url);
    }
  }, [mode, fileName, filePath, editorConfig.document?.url, deleteFileAfterEdit]);

  const validateConfig = (config: IConfig) =>
    !(!config.document || !config.document.url || !config.editorConfig?.callbackUrl);

  const handleLoadComponentError = (errorCode: number) => {
    switch (errorCode) {
      default:
        if (editorConfig.document?.url) {
          void deleteFileAfterEdit(editorConfig.document.url);
        }
    }
  };

  let className = 'h-full';
  if (isOpenedInNewTab) {
    className = 'h-dvh';
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
