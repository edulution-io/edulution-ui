import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import delay from '@/lib/delay';

type UserStore = {
  user: string;
  webdavKey: string;
  isAuthenticated: boolean;
  isLoggedInInEduApi: boolean;
  setIsLoggedInInEduApi: (isLoggedIn: boolean) => void;
  setUser: (user: string) => void;
  isPreparingLogout: boolean;
  logout: () => Promise<void>;
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
  isPreparingLogout: false,
  token: '',
};

type PersistedUserStore = (
  userData: StateCreator<UserStore>,
  options: PersistOptions<UserStore>,
) => StateCreator<UserStore>;

const useUserStore = create<UserStore>(
  (persist as PersistedUserStore)(
    (set) => ({
      ...initialState,
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
      logout: async () => {
        set({ isPreparingLogout: true });
        await delay(50);
        set({ isAuthenticated: false });
        sessionStorage.clear();
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
