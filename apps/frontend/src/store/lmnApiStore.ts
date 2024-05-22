import { create, StateCreator } from 'zustand';
import UserLmnInfo from '@/datatypes/userInfo';
import lmnApiBasicAuth from '@/api/lmnApiBasicAuth';
import lmnApi from '@/api/lmnApi';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import userStore from './userStore';

interface UserLmnInfoStore {
  lmnApiToken: string;
  userData: UserLmnInfo | null;
  loading: boolean;
  error: Error | null;
  setLmnApiToken: (username: string, password: string) => Promise<void>;
  setToken: (token: string) => void;
  getUserData: () => Promise<void>;
  reset: () => void;
}

const initialState: Omit<UserLmnInfoStore, 'setLmnApiToken' | 'getUserData' | 'setToken' | 'reset'> = {
  lmnApiToken: '',
  userData: null,
  loading: false,
  error: null,
};

type PersistedUserLmnInfoStore = (
  userData: StateCreator<UserLmnInfoStore>,
  options: PersistOptions<UserLmnInfoStore>,
) => StateCreator<UserLmnInfoStore>;

const useLmnUserStore = create<UserLmnInfoStore>(
  (persist as PersistedUserLmnInfoStore)(
    (set) => ({
      ...initialState,

      setToken: (token: string) => {
        set({ lmnApiToken: token });
      },
      setLmnApiToken: async (username, password): Promise<void> => {
        set({ loading: true });

        try {
          lmnApiBasicAuth.defaults.headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
          const response = await lmnApiBasicAuth.get<string>('/auth/');
          set({ loading: false, error: null, lmnApiToken: response.data });
        } catch (error) {
          set({ error: error as Error, loading: false });
        }
      },
      getUserData: async () => {
        set({ loading: true });
        try {
          const response = await lmnApi.get(`/users/${userStore.getState().user}`);
          set({
            userData: response.data as UserLmnInfo,
            loading: false,
            error: null,
          });
        } catch (error) {
          set({ error: error as Error, loading: false });
        }
      },
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'lmn-user-storage',
      storage: createJSONStorage(() => sessionStorage),
    } as PersistOptions<UserLmnInfoStore>,
  ),
);

export default useLmnUserStore;
