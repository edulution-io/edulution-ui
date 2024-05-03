import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';

type UserDataStore = {
  user: string;
  webdavKey: string;
  isAuthenticated: boolean;
  setUser: (user: string) => void;
  setWebdavKey: (webdavKey: string) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
};

type PersistedUserDataStore = (
  userData: StateCreator<UserDataStore>,
  options: PersistOptions<UserDataStore>,
) => StateCreator<UserDataStore>;

const useUserDataStore = create<UserDataStore>(
  (persist as PersistedUserDataStore)(
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

export default useUserDataStore;
