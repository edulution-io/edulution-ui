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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { VPNIcon } from '@/assets/icons';
import PageLayout from '@/components/structure/layout/PageLayout';
import { SectionAccordion, SectionAccordionItem } from '@/components/ui/SectionAccordion';
import { Button } from '@/components/shared/Button';
import cn from '@libs/common/utils/className';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import useUserWireguardStore from './useUserWireguardStore';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

const UserSettingsWireguardPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    peer,
    peerStatus,
    qrCode,
    config,
    isLoading,
    hasPeer,
    fetchPeer,
    fetchPeerStatus,
    fetchQRCode,
    fetchConfig,
    downloadConfig,
    reset,
  } = useUserWireguardStore();

  useEffect(() => {
    void fetchPeer();
    return () => reset();
  }, [fetchPeer, reset]);

  useEffect(() => {
    if (hasPeer) {
      void fetchPeerStatus();
      void fetchQRCode();
      void fetchConfig();
    }
  }, [hasPeer, fetchPeerStatus, fetchQRCode, fetchConfig]);

  if (isLoading) {
    return (
      <PageLayout
        nativeAppHeader={{
          title: t('usersettings.wireguard.title'),
          description: t('usersettings.wireguard.description'),
          iconSrc: VPNIcon,
        }}
      >
        <div className="flex items-center justify-center py-12">
          <CircleLoader />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('usersettings.wireguard.title'),
        description: t('usersettings.wireguard.description'),
        iconSrc: VPNIcon,
      }}
    >
      {!hasPeer ? (
        <div className="bg-glass rounded-xl p-6 text-center dark:bg-muted-background">
          <p className="text-muted-foreground">{t('usersettings.wireguard.noPeer')}</p>
        </div>
      ) : (
        <SectionAccordion defaultOpenAll>
          <SectionAccordionItem
            id="status"
            label={t('usersettings.wireguard.connectionStatus')}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'h-3 w-3 rounded-full',
                    peerStatus?.status === 'connected' ? 'bg-green-500' : 'bg-red-500',
                  )}
                />
                <span className="font-medium">
                  {peerStatus?.status === 'connected'
                    ? t('usersettings.wireguard.connected')
                    : t('usersettings.wireguard.disconnected')}
                </span>
              </div>
              {peerStatus?.last_handshake && (
                <p className="text-sm text-muted-foreground">
                  {t('usersettings.wireguard.lastHandshake')}: {peerStatus.last_handshake}
                </p>
              )}
              {peerStatus?.transfer && (
                <div className="text-sm text-muted-foreground">
                  <p>
                    {t('usersettings.wireguard.received')}: {formatBytes(peerStatus.transfer.received)}
                  </p>
                  <p>
                    {t('usersettings.wireguard.sent')}: {formatBytes(peerStatus.transfer.send)}
                  </p>
                </div>
              )}
            </div>
          </SectionAccordionItem>

          <SectionAccordionItem
            id="details"
            label={t('usersettings.wireguard.connectionDetails')}
          >
            <div className="space-y-3">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('usersettings.wireguard.peerName')}:</span>
                  <span className="font-mono">{peer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('usersettings.wireguard.ipAddress')}:</span>
                  <span className="font-mono">{peer?.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('usersettings.wireguard.routes')}:</span>
                  <span className="font-mono">{peer?.routes?.join(', ')}</span>
                </div>
              </div>
            </div>
          </SectionAccordionItem>

          <SectionAccordionItem
            id="qrCode"
            label={t('usersettings.wireguard.qrCode')}
          >
            <div className="space-y-4">
              <p className="text-muted-foreground">{t('usersettings.wireguard.qrCodeDescription')}</p>
              {qrCode ? (
                <div className="flex justify-center">
                  <img
                    src={`data:image/png;base64,${qrCode}`}
                    alt="WireGuard QR Code"
                    className="rounded-lg bg-white p-4"
                  />
                </div>
              ) : (
                <div className="flex justify-center py-8">
                  <CircleLoader />
                </div>
              )}
            </div>
          </SectionAccordionItem>

          <SectionAccordionItem
            id="config"
            label={t('usersettings.wireguard.configDownload')}
          >
            <div className="space-y-4">
              <p className="text-muted-foreground">{t('usersettings.wireguard.configDownloadDescription')}</p>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="btn-infrastructure"
                  size="lg"
                  onClick={downloadConfig}
                  disabled={!config}
                >
                  <FontAwesomeIcon
                    icon={faDownload}
                    className="mr-2"
                  />
                  {t('usersettings.wireguard.downloadButton')}
                </Button>
              </div>
            </div>
          </SectionAccordionItem>
        </SectionAccordion>
      )}
    </PageLayout>
  );
};

export default UserSettingsWireguardPage;
