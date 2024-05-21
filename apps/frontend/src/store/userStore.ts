import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { CustomIdTokenClaims, OriginalIdTokenClaims, processIdTokenClaims } from '@/datatypes/types';

type UserStore = {
  user: string;
  webdavKey: string;
  basicAuth: string;
  isAuthenticated: boolean;
  userInfo: CustomIdTokenClaims;
  isLoggedInInEduApi: boolean;
  setIsLoggedInInEduApi: (isLoggedIn: boolean) => void;
  setUser: (user: string) => void;
  token: string;
  setToken: (token: string) => void;
  setWebdavKey: (webdavKey: string) => void;
  setUserInfo: (user: OriginalIdTokenClaims) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setBasicAuth: (basicAuth: string) => void;
  reset: () => void;
};

const initialState: Omit<
  UserStore,
  | 'setIsLoggedInInEduApi'
  | 'setUser'
  | 'setToken'
  | 'setWebdavKey'
  | 'setBasicAuth'
  | 'reset'
  | 'setIsAuthenticated'
  | 'setUserInfo'
> = {
  user: '',
  webdavKey: '',
  isAuthenticated: false,
  isLoggedInInEduApi: false,
  token: '',
  basicAuth: 'Basic',
  userInfo: {} as CustomIdTokenClaims,
};

type PersistedUserStore = (
  userData: StateCreator<UserStore>,
  options: PersistOptions<UserStore>,
) => StateCreator<UserStore>;

const useUserStore = create<UserStore>(
  (persist as PersistedUserStore)(
    (set) => ({
      ...initialState,

      setUserInfo: (userInfo: OriginalIdTokenClaims) => {
        const processedUserInfo = processIdTokenClaims(userInfo);
        set({ userInfo: processedUserInfo });
      },

      setUser: (user: string) => {
        set({ user });
      },
      webdavKey: '',
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
      setToken: (token) => set({ token }),

      setBasicAuth: (basicAuth: string) => {
        set({ basicAuth });
      },

      reset: () => {
        set({ ...initialState });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useUserStore;
