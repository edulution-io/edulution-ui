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
import { createJSONStorage, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import i18n from '@/i18n';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/lmnApiEduApiEndpoints';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import type QuotaResponse from '@libs/lmnApi/types/lmnApiQuotas';
import type ListManagementEntry from '@libs/userManagement/types/listManagementEntry';
import type ListData from '@libs/userManagement/types/listData';
import EMPTY_LIST_DATA from '@libs/userManagement/constants/emptyListData';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import SOPHOMORIX_QUERY_PARAMS from '@libs/userManagement/constants/sophomorixQueryParams';
import { isCommentEntry } from '@libs/userManagement/utils/csvUtils';

const { ROLES, LIST_MANAGEMENT, USER, USERS_QUOTA } = LMN_API_EDU_API_ENDPOINTS;

type UserManagementStore = {
  usersByType: Partial<Record<string, LmnUserInfo[]>>;
  listDataByType: Partial<Record<string, ListData>>;

  isLoadingUsers: boolean;
  isLoadingList: boolean;
  isBackgroundFetchingUsers: boolean;
  isBackgroundFetchingList: boolean;
  isLoadingUserDetails: boolean;
  isSaving: boolean;
  selectedUserDetails: LmnUserInfo | null;
  selectedUserQuota: QuotaResponse | null;
  error: string | null;

  fetchUsersByRole: (userType: string, role: string, school?: string, managementList?: string) => Promise<void>;
  fetchManagementList: (school: string, managementList: string, force?: boolean) => Promise<void>;
  saveManagementList: (
    school: string,
    managementList: string,
    data: ListManagementEntry[],
    silent?: boolean,
  ) => Promise<void>;
  fetchSelectedUserDetails: (username: string) => Promise<void>;
  setSelectedUserDetails: (user: LmnUserInfo | null) => void;
  getListData: (managementList: string) => ListData;
  setManagementListEntries: (managementList: string, entries: ListManagementEntry[]) => void;
  addDeletedEntryIndex: (managementList: string, index: number) => void;
  reset: () => void;
};

const initialState = {
  usersByType: {} as Partial<Record<string, LmnUserInfo[]>>,
  listDataByType: {} as Partial<Record<string, ListData>>,
  isLoadingUsers: false,
  isLoadingList: false,
  isBackgroundFetchingUsers: false,
  isBackgroundFetchingList: false,
  isLoadingUserDetails: false,
  isSaving: false,
  selectedUserDetails: null as LmnUserInfo | null,
  selectedUserQuota: null as QuotaResponse | null,
  error: null as string | null,
};

const hasUnsavedChanges = (listData: ListData): boolean => {
  if (listData.deletedEntryIndices.length > 0) return true;
  if (listData.managementListEntries.length !== listData.savedListEntries.length) return true;
  return listData.managementListEntries.some(
    (entry, i) => JSON.stringify(entry) !== JSON.stringify(listData.savedListEntries[i]),
  );
};

const useUserManagementStore = create<UserManagementStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchUsersByRole: async (userType: string, role: string, school?: string, managementList?: string) => {
        const cached = get().usersByType[userType];
        const isBackground = !!cached?.length;

        if (isBackground) {
          if (get().isBackgroundFetchingUsers) return;
          set({ isBackgroundFetchingUsers: true, error: null });
        } else {
          if (get().isLoadingUsers) return;
          set({ isLoadingUsers: true, error: null });
        }

        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnUserInfo[]>(`${ROLES}/${role}`, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
            params: {
              [SOPHOMORIX_QUERY_PARAMS.SCHOOL]: school,
              [SOPHOMORIX_QUERY_PARAMS.MANAGEMENT_LIST]: managementList,
            },
          });
          set((s) => ({ usersByType: { ...s.usersByType, [userType]: response.data } }));
        } catch (error) {
          handleApiError(error, set);
        } finally {
          if (isBackground) {
            set({ isBackgroundFetchingUsers: false });
          } else {
            set({ isLoadingUsers: false });
          }
        }
      },

      fetchManagementList: async (school: string, managementList: string, force?: boolean) => {
        const cached = get().listDataByType[managementList];
        const isBackground = !force && !!cached?.managementListEntries.length;

        if (isBackground) {
          if (get().isBackgroundFetchingList) return;
          set({ isBackgroundFetchingList: true, error: null });
        } else {
          if (get().isLoadingList) return;
          set({ isLoadingList: true, error: null });
        }

        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<ListManagementEntry[]>(`${LIST_MANAGEMENT}/${school}/${managementList}`, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });
          const entries = response.data.filter((entry) => !isCommentEntry(entry));

          if (isBackground && cached && hasUnsavedChanges(cached)) {
            set((s) => ({
              listDataByType: {
                ...s.listDataByType,
                [managementList]: { ...cached, savedListEntries: entries },
              },
            }));
          } else {
            set((s) => ({
              listDataByType: {
                ...s.listDataByType,
                [managementList]: {
                  managementListEntries: entries,
                  savedListEntries: entries,
                  deletedEntryIndices: [],
                },
              },
            }));
          }
        } catch (error) {
          handleApiError(error, set);
        } finally {
          if (isBackground) {
            set({ isBackgroundFetchingList: false });
          } else {
            set({ isLoadingList: false });
          }
        }
      },

      saveManagementList: async (
        school: string,
        managementList: string,
        data: ListManagementEntry[],
        silent?: boolean,
      ) => {
        if (get().isSaving) return;
        set({ isSaving: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          await eduApi.post(
            `${LIST_MANAGEMENT}/${school}/${managementList}`,
            { data },
            {
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
            },
          );
          set((s) => ({
            listDataByType: {
              ...s.listDataByType,
              [managementList]: {
                managementListEntries: data,
                savedListEntries: data,
                deletedEntryIndices: [],
              },
            },
          }));
          if (!silent) {
            toast.success(i18n.t('usermanagement.listSaved'));
          }
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isSaving: false });
        }
      },

      fetchSelectedUserDetails: async (username: string) => {
        set({ isLoadingUserDetails: true });
        const { lmnApiToken } = useLmnApiStore.getState();
        const headers = { [HTTP_HEADERS.XApiKey]: lmnApiToken };

        const [userResult, quotaResult] = await Promise.allSettled([
          eduApi.get<LmnUserInfo>(`${USER}/${username}`, { headers }),
          eduApi.get<QuotaResponse>(`${USER}/${username}/${USERS_QUOTA}`, { headers }),
        ]);

        const currentUser = get().selectedUserDetails;
        if (currentUser) {
          set({
            selectedUserDetails: userResult.status === 'fulfilled' ? userResult.value.data : currentUser,
            selectedUserQuota: quotaResult.status === 'fulfilled' ? quotaResult.value.data : null,
          });
        }
        set({ isLoadingUserDetails: false });
      },

      setSelectedUserDetails: (user: LmnUserInfo | null) => {
        set({ selectedUserDetails: user, selectedUserQuota: null });
      },

      getListData: (managementList: string): ListData => get().listDataByType[managementList] ?? EMPTY_LIST_DATA,

      setManagementListEntries: (managementList: string, entries: ListManagementEntry[]) => {
        const existing = get().listDataByType[managementList] ?? EMPTY_LIST_DATA;
        set((s) => ({
          listDataByType: {
            ...s.listDataByType,
            [managementList]: { ...existing, managementListEntries: entries },
          },
        }));
      },

      addDeletedEntryIndex: (managementList: string, index: number) => {
        const existing = get().listDataByType[managementList] ?? EMPTY_LIST_DATA;
        set((s) => ({
          listDataByType: {
            ...s.listDataByType,
            [managementList]: { ...existing, deletedEntryIndices: [...existing.deletedEntryIndices, index] },
          },
        }));
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'user-management-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usersByType: state.usersByType,
        listDataByType: state.listDataByType,
      }),
    },
  ),
);

export default useUserManagementStore;
