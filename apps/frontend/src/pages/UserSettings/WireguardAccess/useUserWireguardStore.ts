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
import WIREGUARD_API_ENDPOINT from '@libs/wireguard/constants/wireguardApiEndpoint';
import type { Peer, PeerConfig, PeerStatus } from '@libs/wireguard/types/wireguard';

interface UserWireguardStore {
  peer: Peer | null;
  peerStatus: PeerStatus | null;
  qrCode: string | null;
  config: string | null;
  isLoading: boolean;
  error: string | null;
  hasPeer: boolean;

  fetchPeer: () => Promise<void>;
  fetchPeerStatus: () => Promise<void>;
  fetchQRCode: () => Promise<void>;
  fetchConfig: () => Promise<void>;
  downloadConfig: () => void;
  reset: () => void;
}

const initialState = {
  peer: null,
  peerStatus: null,
  qrCode: null,
  config: null,
  isLoading: false,
  error: null,
  hasPeer: false,
};

const useUserWireguardStore = create<UserWireguardStore>((set) => ({
  ...initialState,

  fetchPeer: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<Peer>(`${WIREGUARD_API_ENDPOINT}/user/peer`);
      set({ peer: response.data, hasPeer: true, isLoading: false });
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 404) {
        set({ peer: null, hasPeer: false, isLoading: false });
      } else {
        handleApiError(error, set);
      }
    }
  },

  fetchPeerStatus: async () => {
    try {
      const response = await eduApi.get<PeerStatus | false>(`${WIREGUARD_API_ENDPOINT}/user/peer/status`);
      if (response.data !== false) {
        set({ peerStatus: response.data });
      } else {
        set({ peerStatus: null });
      }
    } catch {
      set({ peerStatus: null });
    }
  },

  fetchQRCode: async () => {
    try {
      const response = await eduApi.get<string>(`${WIREGUARD_API_ENDPOINT}/user/peer/qr/b64`);
      set({ qrCode: response.data });
    } catch {
      set({ qrCode: null });
    }
  },

  fetchConfig: async () => {
    try {
      const response = await eduApi.get<PeerConfig>(`${WIREGUARD_API_ENDPOINT}/user/peer/config`);
      set({ config: response.data.data });
    } catch {
      set({ config: null });
    }
  },

  downloadConfig: () => {
    const { config, peer } = useUserWireguardStore.getState();
    if (!config || !peer) return;

    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${peer.name}.conf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  reset: () => set(initialState),
}));

export default useUserWireguardStore;
