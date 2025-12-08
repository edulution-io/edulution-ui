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
