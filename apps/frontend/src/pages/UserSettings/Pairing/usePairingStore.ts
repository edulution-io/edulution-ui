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
import { toast } from 'sonner';
import { HttpStatusCode } from 'axios';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import i18n from '@/i18n';
import PAIRING_API_ENDPOINT from '@libs/pairing/constants/pairingApiEndpoint';
import type PairingDto from '@libs/pairing/types/pairingDto';
import type PairingCodeResponseDto from '@libs/pairing/types/pairingCodeResponseDto';

interface PairingStore {
  pairingCode: string | null;
  relationships: PairingDto[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchPairingCode: () => Promise<void>;
  refreshPairingCode: () => Promise<void>;
  submitPairingCode: (code: string) => Promise<boolean>;
  fetchRelationships: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  pairingCode: null,
  relationships: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const usePairingStore = create<PairingStore>((set) => ({
  ...initialState,

  fetchPairingCode: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<PairingCodeResponseDto>(`${PAIRING_API_ENDPOINT}/code`);
      set({ pairingCode: data.code });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshPairingCode: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.put<PairingCodeResponseDto>(`${PAIRING_API_ENDPOINT}/code`);
      set({ pairingCode: data.code });
      toast.success(i18n.t('usersettings.pairing.codeRefreshed'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  submitPairingCode: async (code: string) => {
    set({ isSubmitting: true, error: null });
    try {
      await eduApi.post(PAIRING_API_ENDPOINT, { code });
      toast.success(i18n.t('usersettings.pairing.pairingSuccess'));
      set({ isSubmitting: false });
      return true;
    } catch (error) {
      set({ isSubmitting: false });
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === HttpStatusCode.Gone) {
        toast.error(i18n.t('usersettings.pairing.codeExpired'));
      } else {
        handleApiError(error, set);
      }
      return false;
    }
  },

  fetchRelationships: async () => {
    try {
      const { data } = await eduApi.get<PairingDto[]>(PAIRING_API_ENDPOINT);
      set({ relationships: data });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  reset: () => set(initialState),
}));

export default usePairingStore;
