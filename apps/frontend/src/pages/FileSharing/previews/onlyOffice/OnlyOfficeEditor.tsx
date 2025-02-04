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
  const { setCurrentlyEditingFile, isFullScreenEditingEnabled } = useFileSharingStore();
  const { deleteFileAfterEdit } = useFileEditorStore();
  const { t } = useTranslation();

  const handleDocumentReady = useCallback(() => {
    // TODO: https://github.com/edulution-io/edulution-ui/issues/411
    // void deleteFileAfterEdit(editorConfig.document.url);
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
    <div className={isFullScreenEditingEnabled ? 'relative h-full' : 'relative h-[75vh]'}>
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
