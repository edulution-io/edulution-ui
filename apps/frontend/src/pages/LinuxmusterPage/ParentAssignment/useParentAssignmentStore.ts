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
import { RowSelectionState } from '@tanstack/react-table';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import i18n from '@/i18n';
import useLmnApiStore from '@/store/useLmnApiStore';
import PARENT_CHILD_PAIRING_API_ENDPOINTS from '@libs/parent-child-pairing/constants/parentChildPairingApiEndpoints';
import PARENT_CHILD_PAIRING_QUERY_PARAMS from '@libs/parent-child-pairing/constants/parentChildPairingQueryParams';
import PARENT_CHILD_PAIRING_STATUS from '@libs/parent-child-pairing/constants/parentChildPairingStatus';
import PARENT_CHILD_PAIRING_STATUS_FILTER_ALL from '@libs/parent-child-pairing/constants/parentChildPairingStatusFilterAll';
import type ParentChildPairingDto from '@libs/parent-child-pairing/types/parentChildPairingDto';

interface ParentAssignmentStore {
  pairings: ParentChildPairingDto[];
  isLoading: boolean;
  statusFilter: string;
  selectedSchool: string;
  selectedRows: RowSelectionState;

  fetchPairings: () => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  updateStatusBulk: (ids: string[], status: string) => Promise<void>;
  setStatusFilter: (status: string) => void;
  setSelectedSchool: (school: string) => void;
  setSelectedRows: (rows: RowSelectionState) => void;
}

const useParentAssignmentStore = create<ParentAssignmentStore>((set, get) => ({
  pairings: [],
  isLoading: false,
  statusFilter: PARENT_CHILD_PAIRING_STATUS.PENDING,
  selectedSchool: '',
  selectedRows: {},

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
        `${PARENT_CHILD_PAIRING_API_ENDPOINTS.BASE}/${PARENT_CHILD_PAIRING_API_ENDPOINTS.ALL}`,
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
      const { lmnApiToken } = useLmnApiStore.getState();
      await eduApi.patch(
        `${PARENT_CHILD_PAIRING_API_ENDPOINTS.BASE}/${id}/${PARENT_CHILD_PAIRING_API_ENDPOINTS.STATUS}`,
        { status },
        { headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken } },
      );
      toast.success(i18n.t('parentChildPairing.statusUpdated'));
      await get().fetchPairings();
    } catch (error) {
      handleApiError(error, set);
    }
  },

  updateStatusBulk: async (ids: string[], status: string) => {
    try {
      const { lmnApiToken } = useLmnApiStore.getState();
      await Promise.all(
        ids.map((id) =>
          eduApi.patch(
            `${PARENT_CHILD_PAIRING_API_ENDPOINTS.BASE}/${id}/${PARENT_CHILD_PAIRING_API_ENDPOINTS.STATUS}`,
            { status },
            { headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken } },
          ),
        ),
      );
      toast.success(i18n.t('parentChildPairing.statusUpdated'));
      set({ selectedRows: {} });
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

  setSelectedRows: (selectedRows: RowSelectionState) => {
    set({ selectedRows });
  },
}));

export default useParentAssignmentStore;
