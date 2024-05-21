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
  isMfaEnabled: boolean;
  setIsLoggedInInEduApi: (isLoggedIn: boolean) => void;
  setUser: (user: string) => void;
  token: string;
  setToken: (token: string) => void;
  setWebdavKey: (webdavKey: string) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  reset: () => void;
  postCheckTotp: (otp: string) => Promise<void>;
  getUserInfoFromDb: (username: string, setIsLoading?: boolean) => Promise<UserInfo | null>;
};

type UserInfo = {
  _id: string;
  username: string;
  email: string;
  roles: string[];
  mfaEnabled: boolean;
  isTotpSet: boolean;
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
const EDU_API_USERS_ENDPOINT = 'users';

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

      isMfaEnabled: false,

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

      getUserInfoFromDb: async (username, setIsLoading = true) => {
        set({ isLoading: setIsLoading });
        try {
          const response = await eduApi.get<UserInfo>(`${EDU_API_USERS_ENDPOINT}/${username}`);
          const userInfo = response.data;
          return userInfo;
        } catch (e) {
          handleApiError(e, set);
          return null;
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
