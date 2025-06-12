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
import { usePublicShareFilesStore } from '@/pages/FileSharing/publicShareFiles/usePublicShareFilesStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

const QRCodePublicFileDialog = () => {
  const { isMobileView } = useMedia();
  const {
    setIsShareFileQrCodeDialogOpen,
    isShareFileQrCodeDialogOpen,
    isLoading,
    publicShareFile,
    setPublicShareFile,
  } = usePublicShareFilesStore();

  const { origin } = window.location;

  const handleClose = () => {
    setPublicShareFile(null);
    setIsShareFileQrCodeDialogOpen(false);
  };

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;
    return (
      <QRCodeWithCopyButton
        qrCodeSize={isMobileView ? 'md' : 'lg'}
        url={`${origin}/${publicShareFile?.publicFileLink}`}
        titleTranslationId="conferences.joinUrl"
      />
    );
  };

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      submitButtonText="common.update"
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isShareFileQrCodeDialogOpen}
      handleOpenChange={handleClose}
      title="filesharing.publicFileSharing.editPublicShareFile"
      body={getDialogBody()}
      footer={getFooter()}
      desktopContentClassName="max-w-[60%] max-h-[75%] min-h-fit-content"
    />
  );
};

export default QRCodePublicFileDialog;
