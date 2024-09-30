import { create, StateCreator } from 'zustand';
import { HttpStatus } from '@nestjs/common';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { LMN_API_USER_EDU_API_ENDPOINT } from '@libs/lmnApi/types/eduApiEndpoints';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import UpdateUserDetailsDto from '@libs/userSettings/update-user-details.dto';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import lmnApi from '@/api/lmnApi';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface UseLmnApiStore {
  lmnApiToken: string;
  user: UserLmnInfo | null;
  isLoading: boolean;
  isGetOwnUserLoading: boolean;
  isFetchUserLoading: boolean;
  isPatchingUserLoading: boolean;
  error: Error | null;
  setLmnApiToken: (username: string, password: string) => Promise<void>;
  getOwnUser: () => Promise<void>;
  fetchUser: (name: string) => Promise<UserLmnInfo | null>;
  patchUserDetails: (username: string, details: Partial<UpdateUserDetailsDto>) => Promise<boolean>;
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
          set({ user: response.data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isGetOwnUserLoading: false });
        }
      },

      fetchUser: async (username: string): Promise<UserLmnInfo | null> => {
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

      reset: () => set(initialState),

      patchUserDetails: async (username: string, userDetails: Partial<UpdateUserDetailsDto>): Promise<boolean> => {
        set({ isPatchingUserLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.patch(
            `${LMN_API_USER_EDU_API_ENDPOINT}/${username}`,
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
    }),
    {
      name: 'lmn-user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lmnApiToken: state.lmnApiToken,
        user: state.user,
      }),
    },
  ),
);

export default useLmnApiStore;
