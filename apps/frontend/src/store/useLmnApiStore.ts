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

import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/lmnApiEduApiEndpoints';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import UpdateUserDetailsDto from '@libs/userSettings/update-user-details.dto';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import getSchoolPrefix from '@libs/classManagement/utils/getSchoolPrefix';
import type QuotaResponse from '@libs/lmnApi/types/lmnApiQuotas';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import LinuxmusterVersionResponse from '@libs/lmnApi/types/linuxmusterVersionResponse';

const { USER, USERS_QUOTA, AUTH } = LMN_API_EDU_API_ENDPOINTS;

interface UseLmnApiStore {
  lmnApiToken: string;
  user: LmnUserInfo | null;
  isLoading: boolean;
  isGetOwnUserLoading: boolean;
  isFetchUserLoading: boolean;
  isPatchingUserLoading: boolean;
  isGetVersionLoading: boolean;
  error: Error | null;
  schoolPrefix: string;
  usersQuota: QuotaResponse | null;
  lmnVersions: LinuxmusterVersionResponse;
  setLmnApiToken: () => Promise<void>;
  getOwnUser: () => Promise<void>;
  fetchUser: (name: string, checkIfFirstPasswordIsSet?: boolean) => Promise<LmnUserInfo | null>;
  fetchUsersQuota: (name: string) => Promise<void>;
  patchUserDetails: (details: Partial<UpdateUserDetailsDto>) => Promise<void>;
  getLmnVersion: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  lmnApiToken: '',
  user: null,
  isLoading: false,
  isGetOwnUserLoading: false,
  isFetchUserLoading: false,
  isPatchingUserLoading: false,
  isGetVersionLoading: false,
  error: null,
  schoolPrefix: '',
  usersQuota: null,
  lmnVersions: {} as LinuxmusterVersionResponse,
};

type PersistedUserLmnInfoStore = (
  userData: StateCreator<UseLmnApiStore>,
  options: PersistOptions<Partial<UseLmnApiStore>>,
) => StateCreator<UseLmnApiStore>;

const useLmnApiStore = create<UseLmnApiStore>(
  (persist as PersistedUserLmnInfoStore)(
    (set, get) => ({
      ...initialState,

      setLmnApiToken: async (): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await eduApi.get<string>(AUTH);
          set({ lmnApiToken: data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      getOwnUser: async () => {
        if (!get().lmnApiToken || get().isGetOwnUserLoading) return;
        set({ isGetOwnUserLoading: true, error: null });
        try {
          const response = await eduApi.get<LmnUserInfo>(USER, {
            headers: { [HTTP_HEADERS.XApiKey]: get().lmnApiToken },
          });
          set({ user: response.data, schoolPrefix: getSchoolPrefix(response.data) });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isGetOwnUserLoading: false });
        }
      },

      fetchUser: async (username, checkIfFirstPasswordIsSet): Promise<LmnUserInfo | null> => {
        if (get().isFetchUserLoading) return null;

        set({ isFetchUserLoading: true, error: null });
        try {
          const response = await eduApi.get<LmnUserInfo>(
            `${USER}/${username}?checkFirstPassword=${!!checkIfFirstPasswordIsSet}`,
            {
              headers: { [HTTP_HEADERS.XApiKey]: get().lmnApiToken },
            },
          );
          return response.data;
        } catch (error) {
          handleApiError(error, set);
          return null;
        } finally {
          set({ isFetchUserLoading: false });
        }
      },

      fetchUsersQuota: async (username): Promise<void> => {
        set({ isFetchUserLoading: true, error: null });
        try {
          const { data } = await eduApi.get<QuotaResponse>(`${USER}/${username}/${USERS_QUOTA}`, {
            headers: { [HTTP_HEADERS.XApiKey]: get().lmnApiToken },
          });
          set({ usersQuota: data });
        } catch (error) {
          // TODO: Readd error handling when LMN API 7.3 supports this endpoint, https://github.com/edulution-io/edulution-ui/issues/1331
          // handleApiError(error, set);
          set({ usersQuota: null });
        } finally {
          set({ isFetchUserLoading: false });
        }
      },

      patchUserDetails: async (userDetails) => {
        set({ isPatchingUserLoading: true, error: null });
        try {
          const { data } = await eduApi.patch<LmnUserInfo>(
            `${USER}`,
            { userDetails },
            { headers: { [HTTP_HEADERS.XApiKey]: get().lmnApiToken } },
          );
          set({ user: data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isPatchingUserLoading: false });
        }
      },

      getLmnVersion: async (): Promise<void> => {
        set({ isGetVersionLoading: true, error: null });
        try {
          const { data } = await eduApi.get<LinuxmusterVersionResponse>(
            `${LMN_API_EDU_API_ENDPOINTS.ROOT}/server/lmnversion`,
            {
              headers: { [HTTP_HEADERS.XApiKey]: get().lmnApiToken },
            },
          );
          set({ lmnVersions: data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isGetVersionLoading: false });
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'lmn-user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lmnApiToken: state.lmnApiToken,
        user: state.user,
        schoolPrefix: state.schoolPrefix,
        usersQuota: state.usersQuota,
      }),
    },
  ),
);

export default useLmnApiStore;
