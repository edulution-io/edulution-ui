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

import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import type { Peer, PeerRequest, Site, SiteRequest } from '@libs/wireguard/types/wireguard';
import WIREGUARD_API_ENDPOINT from '@libs/wireguard/constants/wireguardApiEndpoint';

type WireguardPeer = (Peer | Site) & {
  type: 'client' | 'site';
};

type WireguardStore = {
  peers: WireguardPeer[];
  isLoading: boolean;
  error: string | null;
  fetchPeers: () => Promise<void>;
  createPeer: (data: PeerRequest) => Promise<void>;
  createSite: (data: SiteRequest) => Promise<void>;
  deletePeer: (name: string, type: 'client' | 'site') => Promise<void>;
  getPeerQRCode: (name: string) => Promise<string>;
};

const initialState = {
  peers: [],
  isLoading: false,
  error: null,
};

const useWireguardStore = create<WireguardStore>((set, get) => ({
  ...initialState,

  fetchPeers: async () => {
    set({ isLoading: true, error: null });
    try {
      const [peersResponse, sitesResponse] = await Promise.all([
        eduApi
          .get<Record<string, Peer>>(`${WIREGUARD_API_ENDPOINT}/peers`)
          .catch(() => ({ data: {} as Record<string, Peer> })),
        eduApi
          .get<Record<string, Site>>(`${WIREGUARD_API_ENDPOINT}/sites`)
          .catch(() => ({ data: {} as Record<string, Site> })),
      ]);

      const clientPeers: WireguardPeer[] = Object.values(peersResponse.data).map((peer) => ({
        ...peer,
        type: 'client' as const,
      }));

      const sitePeers: WireguardPeer[] = Object.values(sitesResponse.data).map((site) => ({
        ...site,
        type: 'site' as const,
      }));

      set({ peers: [...clientPeers, ...sitePeers], isLoading: false });
    } catch (error) {
      handleApiError(error, set, 'error');
      set({ isLoading: false });
    }
  },

  createPeer: async (data: PeerRequest) => {
    set({ isLoading: true, error: null });
    try {
      await eduApi.post(`${WIREGUARD_API_ENDPOINT}/peers`, data);
      await get().fetchPeers();
    } catch (error) {
      handleApiError(error, set, 'error');
      set({ isLoading: false });
      throw error;
    }
  },

  createSite: async (data: SiteRequest) => {
    set({ isLoading: true, error: null });
    try {
      await eduApi.post(`${WIREGUARD_API_ENDPOINT}/sites`, data);
      await get().fetchPeers();
    } catch (error) {
      handleApiError(error, set, 'error');
      set({ isLoading: false });
      throw error;
    }
  },

  deletePeer: async (name: string, type: 'client' | 'site') => {
    set({ isLoading: true, error: null });
    try {
      const endpoint =
        type === 'site' ? `${WIREGUARD_API_ENDPOINT}/sites/${name}` : `${WIREGUARD_API_ENDPOINT}/peers/${name}`;
      await eduApi.delete(endpoint);
      await get().fetchPeers();
    } catch (error) {
      handleApiError(error, set, 'error');
      set({ isLoading: false });
      throw error;
    }
  },

  getPeerQRCode: async (name: string) => {
    try {
      const response = await eduApi.get<string>(`${WIREGUARD_API_ENDPOINT}/peers/${name}/qr/b64`);
      return response.data;
    } catch (error) {
      handleApiError(error, set, 'error');
      throw error;
    }
  },
}));

export default useWireguardStore;
