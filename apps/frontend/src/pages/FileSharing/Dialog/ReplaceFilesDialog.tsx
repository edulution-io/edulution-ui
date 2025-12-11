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
import isFolderUploadItem from '@libs/filesharing/utils/isFolderUploadItem';
import { UploadItem } from '@libs/filesharing/types/uploadItem';

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

  const newFilesCount = pendingUpload?.newFiles.length ?? 0;
  const hasNewFiles = newFilesCount > 0;

  const duplicateFolders = pendingUpload?.duplicateFiles.filter((file) => isFolderUploadItem(file as UploadItem)) ?? [];
  const duplicateFilesOnly =
    pendingUpload?.duplicateFiles.filter((file) => !isFolderUploadItem(file as UploadItem)) ?? [];

  const folderItems = duplicateFolders.map((file) => ({
    id: file.name,
    name: (file as UploadItem).folderName || file.name,
  }));

  const fileItems = duplicateFilesOnly.map((file) => ({
    id: file.name,
    name: file.name,
  }));

  const hasFolders = duplicateFolders.length > 0;
  const hasFiles = duplicateFilesOnly.length > 0;

  const getDialogBody = () => (
    <div className="text-background">
      {hasFiles && (
        <>
          <p>{t('filesharingUpload.overwriteWarningDescription', { count: duplicateFilesOnly.length })}</p>
          <ItemList items={fileItems} />
        </>
      )}
      {hasFolders && (
        <>
          <p className={duplicateFilesOnly.length > 0 ? 'mt-4' : ''}>
            {t('filesharingUpload.overwriteFolderWarningDescription', { count: duplicateFolders.length })}
          </p>
          <ItemList items={folderItems} />
        </>
      )}
    </div>
  );

  const getDialogTitle = () => {
    if (hasFolders && hasFiles) {
      return t('filesharingUpload.overwriteWarningTitle', {
        count: duplicateFilesOnly.length + duplicateFolders.length,
      });
    }
    if (hasFolders) {
      return t('filesharingUpload.overwriteFolderWarningTitle', { count: duplicateFolders.length });
    }
    return t('filesharingUpload.overwriteWarningTitle', { count: duplicateFilesOnly.length });
  };

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
      title={getDialogTitle()}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default ReplaceFilesDialog;
