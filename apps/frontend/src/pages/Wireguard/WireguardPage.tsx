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

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { SettingsIcon } from '@/assets/icons';
import PageLayout from '@/components/structure/layout/PageLayout';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import useWireguardStore from '@/store/useWireguardStore';
import APPS from '@libs/appconfig/constants/apps';
import getWireguardTableColumns from './getWireguardTableColumns';
import AddPeerDialog from './components/AddPeerDialog';
import QRCodeDialog from './components/QRCodeDialog';

const WireguardPage: React.FC = () => {
  const { t } = useTranslation();
  const { peers, isLoading, fetchPeers, deletePeer } = useWireguardStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPeerForQR, setSelectedPeerForQR] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void fetchPeers();
  }, [fetchPeers]);

  const handlePublicKeyClick = (name: string) => {
    setSelectedPeerForQR(name);
  };

  const handleDelete = async () => {
    const selectedIndices = Object.keys(selectedRows).filter((key) => selectedRows[key]);

    if (selectedIndices.length === 0) {
      toast.error(t('wireguard.noSelection'));
      return;
    }

    try {
      await Promise.all(
        selectedIndices.map((idx) => {
          const peer = peers[Number(idx)];
          return deletePeer(peer.name, peer.type);
        }),
      );
      toast.success(t('wireguard.deleteSuccess'));
      setSelectedRows({});
    } catch (error) {
      toast.error(t('wireguard.deleteFailed'));
    }
  };

  const columns = getWireguardTableColumns({ onPublicKeyClick: handlePublicKeyClick });

  const tableActions = [
    {
      icon: faPlus,
      onClick: () => setIsAddDialogOpen(true),
      translationId: 'wireguard.addPeer',
      disabled: false,
    },
    {
      icon: faTrash,
      onClick: handleDelete,
      translationId: 'wireguard.delete',
      disabled: Object.values(selectedRows).filter(Boolean).length === 0,
    },
  ];

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('wireguard.title'),
        description: t('wireguard.description'),
        iconSrc: SettingsIcon,
      }}
    >
      <div className="flex w-full flex-1 flex-col">
        <ScrollableTable
          data={peers}
          columns={columns}
          actions={tableActions}
          isLoading={isLoading}
          selectedRows={selectedRows}
          onRowSelectionChange={setSelectedRows}
          filterKey="name"
          filterPlaceHolderText={t('wireguard.searchPlaceholder')}
          applicationName={APPS.WIREGUARD}
        />
      </div>

      <AddPeerDialog
        isOpen={isAddDialogOpen}
        handleOpenChange={() => setIsAddDialogOpen(false)}
      />

      <QRCodeDialog
        isOpen={selectedPeerForQR !== null}
        handleOpenChange={() => setSelectedPeerForQR(null)}
        peerName={selectedPeerForQR}
      />
    </PageLayout>
  );
};

export default WireguardPage;
