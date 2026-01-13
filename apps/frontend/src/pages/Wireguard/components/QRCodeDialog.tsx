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

import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import useWireguardStore from '@/store/useWireguardStore';

interface QRCodeDialogProps {
  isOpen: boolean;
  handleOpenChange: () => void;
  peerName: string | null;
}

const QRCodeDialog: FC<QRCodeDialogProps> = ({ isOpen, handleOpenChange, peerName }) => {
  const { t } = useTranslation();
  const { getPeerQRCode } = useWireguardStore();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && peerName) {
      setIsLoading(true);
      setQrCode(null);

      getPeerQRCode(peerName)
        .then((base64) => {
          setQrCode(base64);
        })
        .catch(() => {
          toast.error(t('wireguard.qrCodeFailed'));
          handleOpenChange();
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, peerName, getPeerQRCode, handleOpenChange, t]);

  const renderContent = () => {
    if (isLoading) {
      return <CircleLoader />;
    }

    if (qrCode) {
      return (
        <img
          src={`data:image/png;base64,${qrCode}`}
          alt={t('wireguard.qrCodeAlt')}
          className="max-w-full"
        />
      );
    }

    return <p className="text-muted-foreground">{t('wireguard.noQrCode')}</p>;
  };

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={handleOpenChange}
      title={t('wireguard.qrCode', { name: peerName })}
      desktopContentClassName="max-w-md"
      body={<div className="flex flex-col items-center justify-center p-6">{renderContent()}</div>}
    />
  );
};

export default QRCodeDialog;
