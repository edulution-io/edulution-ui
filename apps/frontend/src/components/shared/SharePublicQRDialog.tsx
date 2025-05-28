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

import React from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import QRCodeWithCopyButton from '@/components/ui/QRCodeWithCopyButton';

interface SharePublicQRDialogProps {
  url: string;
  isOpen: boolean;
  titleTranslationId: string;
  descriptionTranslationId: string;
  handleClose: () => void;
}

const SharePublicQRDialog = ({
  url,
  handleClose,
  descriptionTranslationId,
  titleTranslationId,
  isOpen,
}: SharePublicQRDialogProps) => {
  const { t } = useTranslation();

  const getDialogBody = () => (
    <QRCodeWithCopyButton
      url={url}
      titleTranslationId={t(descriptionTranslationId)}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={handleClose}
      title={t(titleTranslationId)}
      body={getDialogBody()}
      desktopContentClassName="max-w-[60%] max-h-[75%] min-h-fit-content"
    />
  );
};

export default SharePublicQRDialog;
