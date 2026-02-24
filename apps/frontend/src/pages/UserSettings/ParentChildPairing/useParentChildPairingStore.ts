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
import PARENT_CHILD_PAIRING_API_ENDPOINTS from '@libs/parent-child-pairing/constants/parentChildPairingApiEndpoints';
import type ParentChildPairingRelationshipDto from '@libs/parent-child-pairing/types/parentChildPairingRelationshipDto';
import type ParentChildPairingCodeResponseDto from '@libs/parent-child-pairing/types/parentChildPairingCodeResponseDto';

interface ParentChildPairingStore {
  pairingCodeResponse: ParentChildPairingCodeResponseDto | null;
  relationships: ParentChildPairingRelationshipDto[];
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
  pairingCodeResponse: null,
  relationships: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const useParentChildPairingStore = create<ParentChildPairingStore>((set) => ({
  ...initialState,

  fetchPairingCode: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<ParentChildPairingCodeResponseDto>(
        `${PARENT_CHILD_PAIRING_API_ENDPOINTS.BASE}/${PARENT_CHILD_PAIRING_API_ENDPOINTS.CODE}`,
      );
      set({ pairingCodeResponse: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshPairingCode: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.put<ParentChildPairingCodeResponseDto>(
        `${PARENT_CHILD_PAIRING_API_ENDPOINTS.BASE}/${PARENT_CHILD_PAIRING_API_ENDPOINTS.CODE}`,
      );
      set({ pairingCodeResponse: data });
      toast.success(i18n.t('usersettings.parentChildPairing.codeRefreshed'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  submitPairingCode: async (code: string) => {
    set({ isSubmitting: true, error: null });
    try {
      await eduApi.post(PARENT_CHILD_PAIRING_API_ENDPOINTS.BASE, { code });
      toast.success(i18n.t('usersettings.parentChildPairing.pairingSuccess'));
      set({ isSubmitting: false });
      return true;
    } catch (error) {
      set({ isSubmitting: false });
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === HttpStatusCode.Gone) {
        toast.error(i18n.t('usersettings.parentChildPairing.codeExpired'));
      } else {
        handleApiError(error, set);
      }
      return false;
    }
  },

  fetchRelationships: async () => {
    try {
      const { data } = await eduApi.get<ParentChildPairingRelationshipDto[]>(
        `${PARENT_CHILD_PAIRING_API_ENDPOINTS.BASE}/${PARENT_CHILD_PAIRING_API_ENDPOINTS.RELATIONSHIPS}`,
      );
      set({ relationships: data });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  reset: () => set(initialState),
}));

export default useParentChildPairingStore;
