import { create, StateCreator } from 'zustand';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import lmnApi from '@/api/lmnApi';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';

import {
  LMN_API_USER_EDU_API_ENDPOINT,
  LMN_API_USERS_QUOTA_EDU_API_ENDPOINT,
} from '@libs/lmnApi/constants/eduApiEndpoints';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import getSchoolPrefix from '@libs/classManagement/utils/getSchoolPrefix';
import type QuotaResponse from '@libs/lmnApi/types/lmnApiQuotas';

interface UseLmnApiStore {
  lmnApiToken: string;
  user: UserLmnInfo | null;
  isLoading: boolean;
  isGetOwnUserLoading: boolean;
  isFetchUserLoading: boolean;
  error: Error | null;
  schoolPrefix: string;
  usersQuota: QuotaResponse | null;
  setLmnApiToken: (username: string, password: string) => Promise<void>;
  getOwnUser: () => Promise<void>;
  fetchUser: (name: string) => Promise<UserLmnInfo | null>;
  fetchUsersQuota: (name: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  lmnApiToken: '',
  user: null,
  isLoading: false,
  isGetOwnUserLoading: false,
  isFetchUserLoading: false,
  error: null,
  schoolPrefix: '',
  usersQuota: null,
};

type PersistedUserLmnInfoStore = (
  userData: StateCreator<UseLmnApiStore>,
  options: PersistOptions<Partial<UseLmnApiStore>>,
) => StateCreator<UseLmnApiStore>;

const useLmnApiStore = create<UseLmnApiStore>(
  (persist as PersistedUserLmnInfoStore)(
    (set, get) => ({
      ...initialState,

      setLmnApiToken: async (username, password): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
          lmnApi.defaults.headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
          const response = await lmnApi.get<string>('/auth/');
          set({ lmnApiToken: response.data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      getOwnUser: async () => {
        if (get().isGetOwnUserLoading) return;
        set({ isGetOwnUserLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<UserLmnInfo>(LMN_API_USER_EDU_API_ENDPOINT, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });
          set({ user: response.data, schoolPrefix: getSchoolPrefix(response.data) });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isGetOwnUserLoading: false });
        }
      },

      fetchUser: async (username): Promise<UserLmnInfo | null> => {
        set({ isFetchUserLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<UserLmnInfo>(`${LMN_API_USER_EDU_API_ENDPOINT}/${username}`, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });
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
          const { lmnApiToken } = useLmnApiStore.getState();
          const { data } = await eduApi.get<QuotaResponse>(
            `${LMN_API_USER_EDU_API_ENDPOINT}/${username}/${LMN_API_USERS_QUOTA_EDU_API_ENDPOINT}`,
            {
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
            },
          );
          set({ usersQuota: data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isFetchUserLoading: false });
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'lmn-user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lmnApiToken: state.lmnApiToken,
        user: state.user,
        schoolPrefix: state.schoolPrefix,
      }),
    },
  ),
);

export default useLmnApiStore;
