import { create, StateCreator } from 'zustand';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import lmnApi from '@/api/lmnApi';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';

import { LMN_API_USER_EDU_API_ENDPOINT } from '@libs/lmnApi/types/eduApiEndpoints';

interface UseLmnApiStore {
  lmnApiToken: string;
  user: UserLmnInfo | null;
  isLoading: boolean;
  isGetUserLoading: boolean;
  error: Error | null;
  setLmnApiToken: (username: string, password: string) => Promise<void>;
  getOwnUser: () => Promise<void>;
  fetchUser: (name: string) => Promise<UserLmnInfo | null>;
  reset: () => void;
}

const initialState = {
  lmnApiToken: '',
  user: null,
  isLoading: false,
  isGetUserLoading: false,
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
        if (get().isGetUserLoading) return;
        set({ isGetUserLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<UserLmnInfo>(LMN_API_USER_EDU_API_ENDPOINT, {
            headers: { 'x-api-key': lmnApiToken },
          });
          set({ user: response.data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isGetUserLoading: false });
        }
      },

      fetchUser: async (username): Promise<UserLmnInfo | null> => {
        set({ error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<UserLmnInfo>(`${LMN_API_USER_EDU_API_ENDPOINT}/${username}`, {
            headers: { 'x-api-key': lmnApiToken },
          });
          return response.data;
        } catch (error) {
          handleApiError(error, set);
          return null;
        } finally {
          set({ isGetUserLoading: false });
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
      }),
    },
  ),
);

export default useLmnApiStore;
