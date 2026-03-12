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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines } from '@fortawesome/free-solid-svg-icons';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import useOpenFileChoiceDialogStore, {
  OPEN_FILE_CHOICE,
} from '@/pages/FileSharing/Dialog/useOpenFileChoiceDialogStore';
import triggerBrowserDownload from '@libs/common/utils/triggerBrowserDownload';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';

const OpenFileChoiceDialog = () => {
  const { t } = useTranslation();
  const { isOpen, filename, fileUrl, setChoice } = useOpenFileChoiceDialogStore();
  const { setIsFilePreviewVisible, setCurrentlyEditingFile } = useFileEditorStore();

  const handleOpenInEditor = () => {
    setChoice(OPEN_FILE_CHOICE.EDITOR);
  };

  const handleDownload = () => {
    if (fileUrl) {
      triggerBrowserDownload(fileUrl, filename);
    }
    setChoice(OPEN_FILE_CHOICE.DOWNLOAD);
    setIsFilePreviewVisible(false);
    setCurrentlyEditingFile(null);
  };

  const getBody = () => <p className="text-background">{t('filesharing.openFileChoice')}</p>;

  const getFooter = () => (
    <div className="flex flex-wrap justify-end gap-2">
      <DialogFooterButtons
        handleSubmit={handleOpenInEditor}
        submitButtonText="filesharing.openInEditor"
      />
      <DialogFooterButtons
        handleSubmit={handleDownload}
        submitButtonText="filesharing.openOnDevice"
        disableSubmit={!fileUrl}
      />
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      title={filename}
      titleIcon={<FontAwesomeIcon icon={faFileLines} />}
      body={getBody()}
      footer={getFooter()}
    />
  );
};

export default OpenFileChoiceDialog;
