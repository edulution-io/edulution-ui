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

const PublicShareLinksPage = () => {
  const { t } = useTranslation();
  const { share, setShare, closeDialog, dialog } = usePublicShareStore();
  const { origin } = window.location;
  const url = `${origin}/${FileSharingApiEndpoints.PUBLIC_SHARE}/${share?.publicShareId}`;

  const handleClose = () => {
    setShare({} as PublicShareDto);
    closeDialog('qrCode');
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
