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

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useHandelUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandelUploadFileStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import UploadContentBody from '@/pages/FileSharing/utilities/UploadContentBody';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/useUserStore';

const UploadFileDialog = () => {
  const { webdavShare } = useParams();
  const { currentPath } = useFileSharingStore();
  const { isUploadDialogOpen, closeUploadDialog, uploadFiles, isUploading, setFilesToUpload } =
    useHandelUploadFileStore();

  const { eduApiToken } = useUserStore();
  const { t } = useTranslation();
  const [remountKey, setRemountKey] = useState(0);

  const handleClose = () => {
    setFilesToUpload([]);
    setRemountKey((k) => k + 1);
    closeUploadDialog();
  };

  const handleSubmit = async () => {
    closeUploadDialog();
    await uploadFiles(currentPath, eduApiToken, webdavShare);
    setRemountKey((k) => k + 1);
  };

  return (
    <AdaptiveDialog
      isOpen={isUploadDialogOpen}
      handleOpenChange={handleClose}
      title={t('filesharingUpload.title')}
      body={<UploadContentBody key={remountKey} />}
      footer={
        <DialogFooterButtons
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          submitButtonType="submit"
          submitButtonText="filesharingUpload.upload"
          disableSubmit={isUploading}
        />
      }
    />
  );
};

export default UploadFileDialog;
