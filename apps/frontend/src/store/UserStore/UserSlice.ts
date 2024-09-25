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
import { EDU_API_USER_INFO_ENDPOINT } from '@libs/groups/constants/eduApiEndpoints';
import processLdapGroups from '@libs/user/utils/processLdapGroups';
import JwtUser from '@libs/user/types/jwt/jwtUser';
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
};

const WEBDAV_SECRET = import.meta.env.VITE_WEBDAV_KEY as string;

const createUserSlice: StateCreator<UserStore, [], [], UserSlice> = (set, get) => ({
  ...initialState,

  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setEduApiToken: (eduApiToken) => set({ eduApiToken }),
  setWebdavKey: (password: string) => set({ webdavKey: CryptoJS.AES.encrypt(password, WEBDAV_SECRET).toString() }),
  getWebdavKey: () => getDecryptedPassword(get().webdavKey, WEBDAV_SECRET),

  logout: async () => {
    set({ isPreparingLogout: true });
    await delay(200);
    set({ isAuthenticated: false });
  },

  fetchUserAndUpdateInDatabase: async () => {
    set({ userIsLoading: true });
    try {
      const response = await eduApi.get<JwtUser>(EDU_API_USER_INFO_ENDPOINT);
      const newUser = {
        username: response.data.preferred_username,
        email: response.data.email,
        ldapGroups: processLdapGroups(response.data.ldapGroups),
      };
      await get().updateUser(newUser);
      set({ user: { ...get().user, ...newUser } as UserDto });
    } catch (error) {
      handleApiError(error, set, 'userError');
    } finally {
      set({ isAuthenticated: true, userIsLoading: false });
    }
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
