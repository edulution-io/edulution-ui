import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { StateCreator } from 'zustand';
import delay from '@/lib/delay';
import UserStore from '@libs/user/types/store/userStore';
import UserSlice from '@libs/user/types/store/userSlice';
import UserDto from '@libs/user/types/user.dto';
import CryptoJS from 'crypto-js';
import AttendeeDto from '@libs/user/types/attendee.dto';
import { getDecryptedPassword } from '@libs/common/utils';
import { EDU_API_USERS_ENDPOINT, EDU_API_USERS_SEARCH_ENDPOINT } from '@/api/endpoints/users';

const initialState = {
  webdavKey: '',
  isAuthenticated: false,
  isPreparingLogout: false,
  eduApiToken: '',
  user: null,
  userError: null,
  userIsLoading: false,
  searchError: null,
  searchIsLoading: false,
  encryptKey: '',
};

const createUserSlice: StateCreator<UserStore, [], [], UserSlice> = (set, get) => ({
  ...initialState,

  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setEduApiToken: (eduApiToken) => set({ eduApiToken }),
  setWebdavKey: (password: string, encryptKey) =>
    set({ webdavKey: CryptoJS.AES.encrypt(password, encryptKey).toString(), encryptKey }),
  getWebdavKey: () => getDecryptedPassword(get().webdavKey, get().encryptKey),

  logout: async () => {
    set({ isPreparingLogout: true });
    await delay(200);
    set({ isAuthenticated: false });
  },

  createOrUpdateUser: async (user: UserDto) => {
    set({ userIsLoading: true });
    try {
      const { data } = await eduApi.post<UserDto>(EDU_API_USERS_ENDPOINT, user);
      set({ user: data });
      return data;
    } catch (error) {
      handleApiError(error, set, 'userError');
      return undefined;
    } finally {
      set({ isAuthenticated: true, userIsLoading: false });
    }
  },

  getUser: async () => {
    set({ userIsLoading: true });
    try {
      const { data } = await eduApi.get<UserDto>(`${EDU_API_USERS_ENDPOINT}/${get().user?.username}`);
      set({ user: { ...data } });
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

  searchAttendees: async (searchParam) => {
    set({ searchError: null, searchIsLoading: true });
    try {
      const response = await eduApi.get<AttendeeDto[]>(`${EDU_API_USERS_SEARCH_ENDPOINT}/${searchParam}`);

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data?.map((d) => ({
        ...d,
        value: d.username,
        label: `${d.firstName} ${d.lastName} (${d.username})`,
      }));
    } catch (error) {
      handleApiError(error, set, 'searchError');
      return [];
    } finally {
      set({ searchIsLoading: false });
    }
  },

  resetUserSlice: () => set({ ...initialState }),
});

export default createUserSlice;
