import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

type UserStoreOLD = {
  user: string;
  webdavKey: string;
  isAuthenticated: boolean;
  setUser: (user: string) => void;
  setWebdavKey: (webdavKey: string) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
};

type PersistedUserStore = (
  userData: StateCreator<UserStoreOLD>,
  options: PersistOptions<UserStoreOLD>,
) => StateCreator<UserStoreOLD>;

const useUserStoreOLD = create<UserStoreOLD>(
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
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useUserStoreOLD;
