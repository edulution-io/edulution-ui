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

import QRCodeWithCopyButton from '@/components/ui/QRCodeWithCopyButton';
import React from 'react';
import useMedia from '@/hooks/useMedia';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';

const QRCodePublicShareDialog = () => {
  const { isMobileView } = useMedia();
  const { setIsPublicShareQrCodeDialogOpen, isPublicShareQrCodeDialogOpen, isLoading, share, setShare } =
    usePublicShareStore();

  const { origin } = window.location;

  const { t } = useTranslation();

  const handleClose = () => {
    setShare(null);
    setIsPublicShareQrCodeDialogOpen(false);
  };

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;
    return (
      <QRCodeWithCopyButton
        qrCodeSize={isMobileView ? 'md' : 'lg'}
        url={`${origin}/${FileSharingApiEndpoints.PUBLIC_SHARE}/${share?.publicShareId}`}
        titleTranslationId="conferences.joinUrl"
      />
    );
  };

  const getFooter = () => <DialogFooterButtons handleClose={handleClose} />;

  return (
    <AdaptiveDialog
      isOpen={isPublicShareQrCodeDialogOpen}
      handleOpenChange={handleClose}
      title={t('filesharing.publicFileSharing.qrCodePublicShareFile')}
      body={getDialogBody()}
      footer={getFooter()}
      desktopContentClassName="max-w-[60%] max-h-[75%] min-h-fit-content"
    />
  );
};

export default QRCodePublicShareDialog;
