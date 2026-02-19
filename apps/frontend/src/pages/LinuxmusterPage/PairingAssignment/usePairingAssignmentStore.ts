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
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import i18n from '@/i18n';
import { PAIRING_API_ENDPOINT } from '@libs/pairing/constants/pairingApiEndpoint';
import PAIRING_ADMIN_ENDPOINTS from '@libs/pairing/constants/pairingAdminEndpoints';
import PAIRING_QUERY_PARAMS from '@libs/pairing/constants/pairingQueryParams';
import PAIRING_STATUS from '@libs/pairing/constants/pairingStatus';
import PAIRING_STATUS_FILTER_ALL from '@libs/pairing/constants/pairingStatusFilterAll';
import type PairingDto from '@libs/pairing/types/pairingDto';

interface PairingAssignmentStore {
  pairings: PairingDto[];
  isLoading: boolean;
  statusFilter: string;
  selectedSchool: string;

  fetchPairings: () => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  setStatusFilter: (status: string) => void;
  setSelectedSchool: (school: string) => void;
}

const usePairingAssignmentStore = create<PairingAssignmentStore>((set, get) => ({
  pairings: [],
  isLoading: false,
  statusFilter: PAIRING_STATUS.PENDING,
  selectedSchool: '',

  fetchPairings: async () => {
    set({ isLoading: true });
    try {
      const { statusFilter, selectedSchool } = get();
      const params: Record<string, string> = {};
      if (statusFilter !== PAIRING_STATUS_FILTER_ALL) {
        params.status = statusFilter;
      }
      if (selectedSchool) {
        params[PAIRING_QUERY_PARAMS.SCHOOL] = selectedSchool;
      }
      const { data } = await eduApi.get<PairingDto[]>(`${PAIRING_API_ENDPOINT}/${PAIRING_ADMIN_ENDPOINTS.ALL}`, {
        params,
      });
      set({ pairings: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  updateStatus: async (id: string, status: string) => {
    try {
      await eduApi.patch(`${PAIRING_API_ENDPOINT}/${id}/${PAIRING_ADMIN_ENDPOINTS.STATUS}`, { status });
      toast.success(i18n.t('pairing.statusUpdated'));
      await get().fetchPairings();
    } catch (error) {
      handleApiError(error, set);
    }
  },

  setStatusFilter: (statusFilter: string) => {
    set({ statusFilter });
    void get().fetchPairings();
  },

  setSelectedSchool: (selectedSchool: string) => {
    set({ selectedSchool });
    void get().fetchPairings();
  },
}));

export default usePairingAssignmentStore;
