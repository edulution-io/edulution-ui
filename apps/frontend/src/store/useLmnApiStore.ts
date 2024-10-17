import { create, StateCreator } from 'zustand';
import { HttpStatus } from '@nestjs/common';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/eduApiEndpoints';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import UpdateUserDetailsDto from '@libs/userSettings/update-user-details.dto';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import getSchoolPrefix from '@libs/classManagement/utils/getSchoolPrefix';
import type QuotaResponse from '@libs/lmnApi/types/lmnApiQuotas';
import lmnApi from '@/api/lmnApi';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

const { USER, USERS_QUOTA } = LMN_API_EDU_API_ENDPOINTS;

interface UseLmnApiStore {
  lmnApiToken: string;
  user: UserLmnInfo | null;
  isLoading: boolean;
  isGetOwnUserLoading: boolean;
  isFetchUserLoading: boolean;
  isPatchingUserLoading: boolean;
  error: Error | null;
  schoolPrefix: string;
  usersQuota: QuotaResponse | null;
  setLmnApiToken: (username: string, password: string) => Promise<void>;
  getOwnUser: () => Promise<void>;
  fetchUser: (name: string) => Promise<UserLmnInfo | null>;
  fetchUsersQuota: (name: string) => Promise<void>;
  patchUserDetails: (details: Partial<UpdateUserDetailsDto>) => Promise<boolean>;
  reset: () => void;
}

const initialState = {
  lmnApiToken: '',
  user: null,
  isLoading: false,
  isGetOwnUserLoading: false,
  isFetchUserLoading: false,
  isPatchingUserLoading: false,
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
          const response = await eduApi.get<UserLmnInfo>(USER, {
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
          const response = await eduApi.get<UserLmnInfo>(`${USER}/${username}`, {
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
          const { data } = await eduApi.get<QuotaResponse>(`${USER}/${username}/${USERS_QUOTA}`, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });
          set({ usersQuota: data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isFetchUserLoading: false });
        }
      },

      patchUserDetails: async (userDetails): Promise<boolean> => {
        set({ isPatchingUserLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.patch(
            `${USER}`,
            { userDetails },
            { headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken } },
          );
          return response.status === Number(HttpStatus.OK);
        } catch (error) {
          handleApiError(error, set);
          return false;
        } finally {
          set({ isPatchingUserLoading: false });
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
