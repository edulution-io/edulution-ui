import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { StateCreator } from 'zustand';
import { EDU_API_USERS_ENDPOINT } from '@/api/endpoints/users';
import delay from '@/lib/delay';
import UserStore from '@libs/user/types/store/userStore';
import UserSlice from '@libs/user/types/store/userSlice';
import UserDto from '@libs/user/types/user.dto';
import CryptoJS from 'crypto-js';

const initialState = {
  username: '',
  webdavKey: '',
  isAuthenticated: false,
  isLoggedInInEduApi: false,
  isPreparingLogout: false,
  eduApiToken: '',
  user: null,
  userError: null,
  userIsLoading: false,
};

const WEBDAV_SECRET = import.meta.env.VITE_WEBDAV_KEY as string;

const createUserSlice: StateCreator<UserStore, [], [], UserSlice> = (set, get) => ({
  ...initialState,

  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setIsLoggedInInEduApi: (isLoggedInInEduApi: boolean) => set({ isLoggedInInEduApi }),
  setEduApiToken: (eduApiToken) => set({ eduApiToken }),
  setWebdavKey: (password: string) => set({ webdavKey: CryptoJS.AES.encrypt(password, WEBDAV_SECRET).toString() }),
  getWebdavKey: () => CryptoJS.AES.decrypt(get().webdavKey, WEBDAV_SECRET).toString(CryptoJS.enc.Utf8),

  logout: async () => {
    set({ isPreparingLogout: true });
    await delay(200);
    set({ isAuthenticated: false });
  },

  createOrUpdateUser: async (user: UserDto) => {
    set({ userIsLoading: true, user });
    try {
      await eduApi.post<UserDto>(EDU_API_USERS_ENDPOINT, user);
    } catch (error) {
      handleApiError(error, set, 'userError');
    } finally {
      set({ isAuthenticated: true, userIsLoading: false });
    }
  },

  getUser: async () => {
    set({ userIsLoading: true });
    try {
      const response = await eduApi.get<UserDto>(`${EDU_API_USERS_ENDPOINT}/${get().user?.username}`);
      set({ user: response.data });
    } catch (e) {
      handleApiError(e, set, 'userError');
    } finally {
      set({ userIsLoading: false });
    }
  },

  updateUser: async (userInfo) => {
    set({ userIsLoading: true });
    try {
      await eduApi.patch<UserDto>(`${EDU_API_USERS_ENDPOINT}/${get().user?.username}`, userInfo);
    } catch (error) {
      handleApiError(error, set, 'userError');
    } finally {
      set({ userIsLoading: false });
    }
  },

  resetUserSlice: () => set({ ...initialState }),
});

export default createUserSlice;
