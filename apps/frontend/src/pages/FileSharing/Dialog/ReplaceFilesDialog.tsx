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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import ItemList from '@/components/shared/ItemList';
import useReplaceFilesDialogStore from '@/pages/FileSharing/Dialog/useReplaceFilesDialogStore';
import useFileUploadWithReplace from '@/pages/FileSharing/hooks/useFileUploadWithReplace';

const ReplaceFilesDialog = () => {
  const { t } = useTranslation();
  const { isOpen, pendingUpload, closeDialog } = useReplaceFilesDialogStore();
  const { uploadFilesDirectly } = useFileUploadWithReplace();

  const handleClose = () => {
    closeDialog();
  };

  const handleUploadNewOnly = async () => {
    if (!pendingUpload) return;
    closeDialog();
    await uploadFilesDirectly(pendingUpload.newFiles, pendingUpload.webdavShare, pendingUpload.currentPath);
  };

  const handleReplaceAll = async () => {
    if (!pendingUpload) return;
    closeDialog();
    await uploadFilesDirectly(pendingUpload.files, pendingUpload.webdavShare, pendingUpload.currentPath);
  };

  const duplicateCount = pendingUpload?.duplicateFiles.length ?? 0;
  const newFilesCount = pendingUpload?.newFiles.length ?? 0;
  const hasNewFiles = newFilesCount > 0;

  const items =
    pendingUpload?.duplicateFiles.map((file) => ({
      id: file.name,
      name: file.name,
    })) ?? [];

  const getDialogBody = () => (
    <div className="text-background">
      <p>
        {t(
          duplicateCount === 1
            ? 'filesharingUpload.overwriteWarningDescriptionFile'
            : 'filesharingUpload.overwriteWarningDescriptionFiles',
        )}
      </p>
      <ItemList items={items} />
    </div>
  );

  const getFooter = () => (
    <div className="flex flex-wrap justify-end gap-2">
      <DialogFooterButtons
        handleClose={handleClose}
        handleSubmit={handleReplaceAll}
        cancelButtonText="common.cancel"
        submitButtonText="filesharingUpload.replaceFiles"
        submitButtonVariant="btn-attention"
      />
      {hasNewFiles && (
        <DialogFooterButtons
          handleSubmit={handleUploadNewOnly}
          submitButtonText="filesharingUpload.uploadNewOnly"
          submitButtonVariant="btn-collaboration"
        />
      )}
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={handleClose}
      title={t(
        duplicateCount === 1
          ? 'filesharingUpload.overwriteWarningTitleFile'
          : 'filesharingUpload.overwriteWarningTitleFiles',
      )}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default ReplaceFilesDialog;
