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

import { create, StoreApi, UseBoundStore } from 'zustand';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { WireguardTableStore } from '@libs/appconfig/types/wireguardTableStore';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import WIREGUARD_API_ENDPOINT from '@libs/wireguard/constants/wireguardApiEndpoint';
import type {
  BatchPeersRequest,
  BatchPeersResult,
  PeerRequest,
  WireguardPeer,
  SiteRequest,
} from '@libs/wireguard/types/wireguard';

const initialValues = {
  selectedRows: {},
  isLoading: false,
  error: null,
  tableContentData: [] as WireguardPeer[],
  selectedConfig: null,
  itemToDelete: null,
};

const useWireguardConfigTableStore: UseBoundStore<StoreApi<WireguardTableStore>> = create<WireguardTableStore>(
  (set, get) => ({
    ...initialValues,

    setSelectedRows: (selectedRows) => set({ selectedRows }),

    setSelectedConfig: (config) => set({ selectedConfig: config }),

    setItemToDelete: (item) => set({ itemToDelete: item }),

    fetchTableContent: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await eduApi.get<Record<string, Omit<WireguardPeer, 'name'>>>(
          `${WIREGUARD_API_ENDPOINT}/peers/status`,
        );
        const peers: WireguardPeer[] = Object.entries(response.data).map(([name, peerData]) => ({
          ...peerData,
          name,
        }));
        set({ tableContentData: peers, isLoading: false });
      } catch (error) {
        handleApiError(error, set, 'error');
        set({ isLoading: false });
      }
    },

    createPeer: async (data: PeerRequest) => {
      set({ isLoading: true, error: null });
      try {
        await eduApi.post(`${WIREGUARD_API_ENDPOINT}/peers`, data);
        await get().fetchTableContent();
        set({ isLoading: false });
        toast.success(i18n.t('wireguard.peerCreated'));
      } catch (error) {
        handleApiError(error, set, 'error');
        set({ isLoading: false });
      }
    },

    createPeers: async (request: BatchPeersRequest) => {
      set({ isLoading: true, error: null });
      try {
        const response = await eduApi.post<BatchPeersResult>(`${WIREGUARD_API_ENDPOINT}/peers/batch`, request);
        const { successful, failed } = response.data;

        await get().fetchTableContent();
        set({ isLoading: false });

        if (failed > 0) {
          toast.warning(i18n.t('wireguard.peersCreatedPartial', { successful, failed }));
        } else {
          toast.success(i18n.t('wireguard.peersCreated', { count: successful }));
        }
      } catch (error) {
        handleApiError(error, set, 'error');
        set({ isLoading: false });
      }
    },

    createSite: async (data: SiteRequest) => {
      set({ isLoading: true, error: null });
      try {
        await eduApi.post(`${WIREGUARD_API_ENDPOINT}/sites`, data);
        await get().fetchTableContent();
        set({ isLoading: false });
        toast.success(i18n.t('wireguard.siteCreated'));
      } catch (error) {
        handleApiError(error, set, 'error');
        set({ isLoading: false });
      }
    },

    deleteTableEntry: async (_applicationName: string, peerIdentifier: string) => {
      set({ isLoading: true, error: null });
      try {
        const { tableContentData } = get();
        const peer = tableContentData.find((p) => p.name === peerIdentifier);

        if (!peer) {
          set({ isLoading: false });
          return;
        }

        await eduApi.delete(`${WIREGUARD_API_ENDPOINT}/peers/${peerIdentifier}`);
        await get().fetchTableContent();
        set({ isLoading: false });
        toast.success(i18n.t('wireguard.deleteSuccess'));
      } catch (error) {
        handleApiError(error, set, 'error');
        set({ isLoading: false });
      }
    },

    getPeerQRCode: async (name: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await eduApi.get<string>(`${WIREGUARD_API_ENDPOINT}/peers/${name}/qr/b64`);
        set({ isLoading: false });
        return response.data;
      } catch (error) {
        handleApiError(error, set, 'error');
        set({ isLoading: false });
        return null;
      }
    },

    reset: () => set(initialValues),
  }),
);

export default useWireguardConfigTableStore;
