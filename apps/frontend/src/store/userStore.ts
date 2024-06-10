import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { EDU_API_USERS_ENDPOINT } from '@/api/endpoints/users';
import JwtUser from '@/datatypes/jwtUser';
import { JwtUserWithLdapGroups } from '@/datatypes/jwtUserWithLdapGroups';
import processLdapGroups from '@/utils/processLdapGroups';
import User from '@/datatypes/user';
import delay from '@/lib/delay';

type UserStore = {
  username: string;
  setUsername: (username: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  user: JwtUserWithLdapGroups | null;
  setUser: (user: JwtUser) => void;
  getUser: (username: string) => Promise<User | null>;
  updateUser: (username: string, user: User) => Promise<void>;
  isLoggedInInEduApi: boolean;
  setIsLoggedInInEduApi: (isLoggedIn: boolean) => void;
  token: string;
  setToken: (token: string) => void;
  webdavKey: string;
  setWebdavKey: (webdavKey: string) => void;
  isPreparingLogout: boolean;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
};

const initialState = {
  username: '',
  webdavKey: '',
  isAuthenticated: false,
  isLoggedInInEduApi: false,
  isPreparingLogout: false,
  token: '',
  user: null,
  error: null,
  isLoading: false,
};

type PersistedUserStore = (
  userData: StateCreator<UserStore>,
  options: PersistOptions<UserStore>,
) => StateCreator<UserStore>;

const useUserStore = create<UserStore>(
  (persist as PersistedUserStore)(
    (set) => ({
      ...initialState,

      setUser: (userInfo: JwtUser) => {
        const user = processLdapGroups(userInfo);
        set({ user });
      },

      setUsername: (username: string) => set({ username }),
      setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
      setIsLoggedInInEduApi: (isLoggedInInEduApi: boolean) => set({ isLoggedInInEduApi }),
      setToken: (token) => set({ token }),
      setWebdavKey: (webdavKey: string) => set({ webdavKey }),

      logout: async () => {
        set({ isPreparingLogout: true });
        await delay(200);
        set({ isAuthenticated: false });
      },

      /*
      TODO: Should return void and instead set the value in the store: NIEDUUI-215
       */
      getUser: async (username) => {
        set({ isLoading: true });
        try {
          const response = await eduApi.get<User>(`${EDU_API_USERS_ENDPOINT}/${username}`);
          return response.data;
        } catch (e) {
          handleApiError(e, set);
          return null;
        }
      },

      updateUser: async (username, userInfo) => {
        set({ isLoading: true });
        try {
          await eduApi.patch<User>(`${EDU_API_USERS_ENDPOINT}/${username}`, userInfo);
          set({ isLoading: false });
        } catch (error) {
          handleApiError(error, set);
        }
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useUserStore;
