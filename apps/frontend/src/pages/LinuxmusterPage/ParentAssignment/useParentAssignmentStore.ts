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
import { PARENT_CHILD_PAIRING_API_ENDPOINT } from '@libs/parent-child-pairing/constants/parentChildPairingApiEndpoint';
import PARENT_CHILD_PAIRING_ADMIN_ENDPOINTS from '@libs/parent-child-pairing/constants/parentChildPairingAdminEndpoints';
import PARENT_CHILD_PAIRING_QUERY_PARAMS from '@libs/parent-child-pairing/constants/parentChildPairingQueryParams';
import PARENT_CHILD_PAIRING_STATUS from '@libs/parent-child-pairing/constants/parentChildPairingStatus';
import PARENT_CHILD_PAIRING_STATUS_FILTER_ALL from '@libs/parent-child-pairing/constants/parentChildPairingStatusFilterAll';
import type ParentChildPairingDto from '@libs/parent-child-pairing/types/parentChildPairingDto';

interface ParentAssignmentStore {
  pairings: ParentChildPairingDto[];
  isLoading: boolean;
  statusFilter: string;
  selectedSchool: string;

  fetchPairings: () => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  setStatusFilter: (status: string) => void;
  setSelectedSchool: (school: string) => void;
}

const useParentAssignmentStore = create<ParentAssignmentStore>((set, get) => ({
  pairings: [],
  isLoading: false,
  statusFilter: PARENT_CHILD_PAIRING_STATUS.PENDING,
  selectedSchool: '',

  fetchPairings: async () => {
    set({ isLoading: true });
    try {
      const { statusFilter, selectedSchool } = get();
      const params: Record<string, string> = {};
      if (statusFilter !== PARENT_CHILD_PAIRING_STATUS_FILTER_ALL) {
        params.status = statusFilter;
      }
      if (selectedSchool) {
        params[PARENT_CHILD_PAIRING_QUERY_PARAMS.SCHOOL] = selectedSchool;
      }
      const { data } = await eduApi.get<ParentChildPairingDto[]>(
        `${PARENT_CHILD_PAIRING_API_ENDPOINT}/${PARENT_CHILD_PAIRING_ADMIN_ENDPOINTS.ALL}`,
        { params },
      );
      set({ pairings: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  updateStatus: async (id: string, status: string) => {
    try {
      await eduApi.patch(`${PARENT_CHILD_PAIRING_API_ENDPOINT}/${id}/${PARENT_CHILD_PAIRING_ADMIN_ENDPOINTS.STATUS}`, {
        status,
      });
      toast.success(i18n.t('parentChildPairing.statusUpdated'));
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

export default useParentAssignmentStore;
