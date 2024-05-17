import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

type UserStore = {
  user: string;
  webdavKey: string;
  isAuthenticated: boolean;
  isLoggedInInEduApi: boolean;
  isLoading: boolean;
  setIsLoggedInInEduApi: (isLoggedIn: boolean) => void;
  setUser: (user: string) => void;
  token: string;
  setToken: (token: string) => void;
  setWebdavKey: (webdavKey: string) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  reset: () => void;
  postCheckTotp: (otp: string) => Promise<void>;
};

const initialState = {
  user: '',
  webdavKey: '',
  isAuthenticated: false,
  isLoggedInInEduApi: false,
  token: '',
};

type PersistedUserStore = (
  userData: StateCreator<UserStore>,
  options: PersistOptions<UserStore>,
) => StateCreator<UserStore>;

const EDU_API_AUTH_ENDPOINT = 'auth';

const useUserStore = create<UserStore>(
  (persist as PersistedUserStore)(
    (set) => ({
      user: '',
      setUser: (user: string) => {
        set({ user });
      },
      webdavKey: '',
      isLoading: false,
      setWebdavKey: (webdavKey: string) => {
        set({ webdavKey });
      },
      isAuthenticated: false,
      setIsAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
      },
      isLoggedInInEduApi: false,
      setIsLoggedInInEduApi: (isLoggedInInEduApi: boolean) => {
        set({ isLoggedInInEduApi });
      },
      token: '',
      setToken: (token) => set({ token }),
      reset: () => set(initialState),

      postCheckTotp: async (otp) => {
        set({ isLoading: true });
        try {
          const response = await eduApi.post(EDU_API_AUTH_ENDPOINT, { totpToken: otp });
          const isTotpValid = response.data as boolean;
          set({ isLoading: false, isAuthenticated: isTotpValid });
        } catch (e) {
          handleApiError(e, set);
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useUserStore;
