import { create, StateCreator } from 'zustand';
import UserLmnInfo from '@/datatypes/userInfo';
import lmnApi from '@/api/lmnApi';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import handleApiError from '@/utils/handleApiError';
import { EDU_API_USERS_ENDPOINT } from '@/api/endpoints/users';
import userStore from '@/store/UserStore/UserStore';

interface LmnApiStore {
  lmnApiToken: string;
  user: UserLmnInfo | null;
  isLoading: boolean;
  error: Error | null;
  setLmnApiToken: (username: string, password: string) => Promise<void>;
  getUserData: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  lmnApiToken: '',
  user: null,
  isLoading: false,
  error: null,
};

type PersistedUserLmnInfoStore = (
  userData: StateCreator<LmnApiStore>,
  options: PersistOptions<Partial<LmnApiStore>>,
) => StateCreator<LmnApiStore>;

const useLmnApiStore = create<LmnApiStore>(
  (persist as PersistedUserLmnInfoStore)(
    (set) => ({
      ...initialState,

      setLmnApiToken: async (username, password): Promise<void> => {
        set({ isLoading: true });

        try {
          lmnApi.defaults.headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
          const response = await lmnApi.get<string>('/auth/');
          set({ isLoading: false, error: null, lmnApiToken: response.data });
        } catch (error) {
          handleApiError(error, set);
        }
      },

      getUserData: async () => {
        set({ isLoading: true });
        try {
          const response = await lmnApi.get<UserLmnInfo>(`${EDU_API_USERS_ENDPOINT}/${userStore.getState().username}`);
          set({
            user: response.data,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          handleApiError(error, set);
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'lmn-user-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        lmnApiToken: state.lmnApiToken,
        user: state.user,
      }),
    },
  ),
);

export default useLmnApiStore;
