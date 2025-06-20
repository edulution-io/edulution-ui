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
import { FilesharingIcon } from '@libs/assets';
import PublicShareTable from '@/pages/FileSharing/publicShare/table/PublicShareTable';
import PublicShareFilesFloatingButtonsBar from '@/pages/FileSharing/FloatingButtonsBar/PublicShareFilesFloatingButtonsBar';
import DeletePublicShareDialog from '@/pages/FileSharing/publicShare/dialog/DeletePublicShareDialog';
import EditPublicShareDialog from '@/pages/FileSharing/publicShare/dialog/EditPublicShareDialog';
import QRCodePublicShareDialog from '@/pages/FileSharing/publicShare/dialog/QRCodePublicShareDialog';

const PublicShareFilesPage = () => {
  const { t } = useTranslation();
  return (
    <PageLayout
      nativeAppHeader={{
        title: t('filesharing.publicShareFilesPage.title'),
        description: t('filesharing.publicShareFilesPage.description'),
        iconSrc: FilesharingIcon,
      }}
    >
      <PublicShareTable />
      <DeletePublicShareDialog />
      <EditPublicShareDialog />
      <QRCodePublicShareDialog />
      <PublicShareFilesFloatingButtonsBar />
    </PageLayout>
  );
};

export default PublicShareFilesPage;
