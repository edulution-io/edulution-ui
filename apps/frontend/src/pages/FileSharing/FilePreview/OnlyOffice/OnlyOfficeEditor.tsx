/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { DocumentEditor } from '@onlyoffice/document-editor-react';
import React, { FC, useCallback } from 'react';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
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

  let className = 'h-full';
  if (isOpenedInNewTab) {
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
