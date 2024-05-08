import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';

type UserStore = {
  user: string;
  webdavKey: string;
  isAuthenticated: boolean;
  setUser: (user: string) => void;
  setWebdavKey: (webdavKey: string) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
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
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useUserStore;
