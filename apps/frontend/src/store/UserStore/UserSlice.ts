import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { StateCreator } from 'zustand';
import { EDU_API_USERS_ENDPOINT } from '@/api/endpoints/users';
import delay from '@/lib/delay';
import UserStore from '@libs/user/types/store/userStore';
import UserSlice from '@libs/user/types/store/userSlice';
import User from '@libs/user/types/user';
import RegisterUserDto from '@libs/user/types/register-user.dto';
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

  setUsername: (username: string) => set({ username }),
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

  createOrUpdateUser: async (user: RegisterUserDto) => {
    set({ userIsLoading: true });
    try {
      await eduApi.post<RegisterUserDto>(EDU_API_USERS_ENDPOINT, user);
    } catch (error) {
      handleApiError(error, set, 'userError');
    } finally {
      set({ isAuthenticated: true, userIsLoading: false });
    }
  },

  /*
  TODO: Should return void and instead set the value in the store: NIEDUUI-215
   */
  getUser: async (username) => {
    set({ userIsLoading: true });
    try {
      const response = await eduApi.get<User>(`${EDU_API_USERS_ENDPOINT}/${username}`);
      set({ user: response.data });
    } catch (e) {
      handleApiError(e, set, 'userError');
    } finally {
      set({ userIsLoading: false });
    }
  },

  updateUser: async (username, userInfo) => {
    set({ userIsLoading: true });
    try {
      await eduApi.patch<User>(`${EDU_API_USERS_ENDPOINT}/${username}`, userInfo);
    } catch (error) {
      handleApiError(error, set, 'userError');
    } finally {
      set({ userIsLoading: false });
    }
  },

  resetUserSlice: () => set({ ...initialState }),
});

export default createUserSlice;
