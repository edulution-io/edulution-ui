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
import PAIRING_API_ENDPOINT from '@libs/pairing/constants/pairingApiEndpoint';
import PAIRING_ADMIN_ENDPOINTS from '@libs/pairing/constants/pairingAdminEndpoints';
import PAIRING_STATUS from '@libs/pairing/constants/pairingStatus';
import type PairingDto from '@libs/pairing/types/pairingDto';
import type PaginatedPairingsDto from '@libs/pairing/types/paginatedPairingsDto';

const DEFAULT_PAGE_LIMIT = 50;

interface PairingAssignmentStore {
  pairings: PairingDto[];
  total: number;
  isLoading: boolean;
  statusFilter: string;
  page: number;

  fetchPairings: () => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;
}

const usePairingAssignmentStore = create<PairingAssignmentStore>((set, get) => ({
  pairings: [],
  total: 0,
  isLoading: false,
  statusFilter: PAIRING_STATUS.PENDING,
  page: 1,

  fetchPairings: async () => {
    set({ isLoading: true });
    try {
      const { statusFilter, page } = get();
      const { data } = await eduApi.get<PaginatedPairingsDto>(
        `${PAIRING_API_ENDPOINT}/${PAIRING_ADMIN_ENDPOINTS.ALL}`,
        {
          params: {
            status: statusFilter,
            page,
            limit: DEFAULT_PAGE_LIMIT,
          },
        },
      );
      set({ pairings: data.data, total: data.total });
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
    set({ statusFilter, page: 1 });
    void get().fetchPairings();
  },

  setPage: (page: number) => {
    set({ page });
    void get().fetchPairings();
  },
}));

export default usePairingAssignmentStore;
