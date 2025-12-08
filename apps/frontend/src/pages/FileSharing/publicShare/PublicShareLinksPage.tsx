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

import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/structure/layout/PageLayout';
import React from 'react';
import PublicShareTable from '@/pages/FileSharing/publicShare/table/PublicShareTable';
import PublicShareFilesFloatingButtonsBar from '@/pages/FileSharing/FloatingButtonsBar/PublicShareFilesFloatingButtonsBar';
import DeletePublicShareDialog from '@/pages/FileSharing/publicShare/dialog/DeletePublicShareDialog';
import { CloudIcon } from '@/assets/icons';
import CreateOrEditPublicShareDialog from '@/pages/FileSharing/publicShare/dialog/CreateOrEditPublicShareDialog';
import SharePublicQRDialog from '@/components/shared/SharePublicQRDialog';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import PublicShareDto from '@libs/filesharing/types/publicShareDto';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import PUBLIC_SHARE_DIALOG_NAMES from '@libs/filesharing/constants/publicShareDialogNames';

const PublicShareLinksPage = () => {
  const { t } = useTranslation();
  const { share, setShare, closeDialog, dialog } = usePublicShareStore();
  const { origin } = window.location;
  const url = `${origin}/${FileSharingApiEndpoints.PUBLIC_SHARE}/${share?.publicShareId}`;

  const handleClose = () => {
    setShare({} as PublicShareDto);
    closeDialog(PUBLIC_SHARE_DIALOG_NAMES.QR_CODE);
  };

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('filesharing.publicShareFilesPage.title'),
        description: t('filesharing.publicShareFilesPage.description'),
        iconSrc: CloudIcon,
      }}
    >
      <PublicShareTable />
      <DeletePublicShareDialog />
      <CreateOrEditPublicShareDialog />
      <SharePublicQRDialog
        isOpen={dialog.qrCode}
        handleClose={handleClose}
        url={url}
        titleTranslationId="filesharing.publicFileSharing.qrCodePublicShareFile"
        descriptionTranslationId=""
      />
      <PublicShareFilesFloatingButtonsBar />
    </PageLayout>
  );
};

export default PublicShareLinksPage;
