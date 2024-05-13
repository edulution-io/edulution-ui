import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

type UserStore = {
  user: string;
  webdavKey: string;
  isAuthenticated: boolean;
  isLoggedInInEduApi: boolean;
  setIsLoggedInInEduApi: (isLoggedIn: boolean) => void;
  setUser: (user: string) => void;
  token: string;
  setToken: (token: string) => void;
  setWebdavKey: (webdavKey: string) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  reset: () => void;
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

const useUserStore = create<UserStore>(
  (persist as PersistedUserStore)(
    (set) => ({
      user: '',
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
      token: '',
      setToken: (token) => set({ token }),
      reset: () => set(initialState),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useUserStore;
