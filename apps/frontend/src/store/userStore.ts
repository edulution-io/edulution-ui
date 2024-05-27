import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { CustomIdTokenClaims, OriginalIdTokenClaims, processIdTokenClaims, UserInfo } from '@/datatypes/types';

type UserStore = {
  user: string;
  basicAuth: string;
  isAuthenticated: boolean;
  userInfo: CustomIdTokenClaims;
  isLoggedInInEduApi: boolean;
  isLoading: boolean;
  isMfaEnabled: boolean;
  setIsLoggedInInEduApi: (isLoggedIn: boolean) => void;
  setUser: (user: string) => void;
  token: string;
  setToken: (token: string) => void;
  webdavKey: string;
  setWebdavKey: (webdavKey: string) => void;
  setUserInfo: (user: OriginalIdTokenClaims) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setBasicAuth: (basicAuth: string) => void;
  reset: () => void;
  postCheckTotp: (otp: string) => Promise<boolean>;
  postSetupTotp: (otp: string) => Promise<boolean>;
  getUserInfoFromDb: (username: string, setIsLoading?: boolean) => Promise<UserInfo | null>;
  updateUserInfo: (username: string, userInfo: UserInfo, setIsLoading?: boolean) => Promise<UserInfo | null>;
  getQrCode: (username: string, setIsLoading?: boolean) => Promise<string | null>;
};

const initialState: Omit<
  UserStore,
  | 'setIsLoggedInInEduApi'
  | 'setUser'
  | 'setToken'
  | 'setWebdavKey'
  | 'setBasicAuth'
  | 'reset'
  | 'setIsAuthenticated'
  | 'setUserInfo'
  | 'isLoading'
  | 'isMfaEnabled'
  | 'postSetupTotp'
  | 'postCheckTotp'
  | 'getUserInfoFromDb'
  | 'updateUserInfo'
  | 'getQrCode'
> = {
  user: '',
  webdavKey: '',
  isAuthenticated: false,
  isLoggedInInEduApi: false,
  token: '',
  basicAuth: 'Basic',
  userInfo: {} as CustomIdTokenClaims,
};

type PersistedUserStore = (
  userData: StateCreator<UserStore>,
  options: PersistOptions<UserStore>,
) => StateCreator<UserStore>;

const EDU_API_AUTH_ENDPOINT = 'auth';
const EDU_API_USERS_ENDPOINT = 'users';

const useUserStore = create<UserStore>(
  (persist as PersistedUserStore)(
    (set) => ({
      ...initialState,

      setUserInfo: (userInfo: OriginalIdTokenClaims) => {
        const processedUserInfo = processIdTokenClaims(userInfo);
        set({ userInfo: processedUserInfo });
      },

      setUser: (user: string) => {
        set({ user });
      },
      isLoading: false,
      isAuthenticated: false,
      setIsAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
      },
      isLoggedInInEduApi: false,
      setIsLoggedInInEduApi: (isLoggedInInEduApi: boolean) => {
        set({ isLoggedInInEduApi });
      },
      setToken: (token) => set({ token }),
      setWebdavKey: (webdavKey: string) => {
        set({ webdavKey });
      },

      setBasicAuth: (basicAuth: string) => {
        set({ basicAuth });
      },

      reset: () => {
        set({ ...initialState });
      },

      isMfaEnabled: false,

      postCheckTotp: async (otp) => {
        set({ isLoading: true });
        try {
          const response = await eduApi.post(EDU_API_AUTH_ENDPOINT, { totpToken: otp });
          const isTotpValid = response.status === 201;
          set({ isLoading: false, isAuthenticated: isTotpValid });
          return isTotpValid;
        } catch (e) {
          handleApiError(e, set);
          return false;
        }
      },

      postSetupTotp: async (otp) => {
        set({ isLoading: true });
        try {
          const response = await eduApi.post(EDU_API_AUTH_ENDPOINT, { totpToken: otp });
          const isTotpValid = response.data as boolean;
          set({ isLoading: false });
          return isTotpValid;
        } catch (e) {
          handleApiError(e, set);
          return false;
        }
      },

      getUserInfoFromDb: async (username, setIsLoading = true) => {
        set({ isLoading: setIsLoading });
        try {
          const response = await eduApi.get<UserInfo>(`${EDU_API_USERS_ENDPOINT}/${username}`);
          const userInfo = response.data;
          return userInfo;
        } catch (e) {
          handleApiError(e, set);
          return null;
        }
      },

      updateUserInfo: async (username, userInfo, setIsLoading = true) => {
        set({ isLoading: setIsLoading });
        try {
          const response = await eduApi.patch(`${EDU_API_USERS_ENDPOINT}/${username}`, userInfo);
          const newUserInfo = response.data as UserInfo;
          set({ isLoading: false });
          return newUserInfo;
        } catch (error) {
          handleApiError(error, set);
          return null;
        }
      },

      getQrCode: async (username, setIsLoading = true) => {
        set({ isLoading: setIsLoading });
        try {
          const response = await eduApi.get<string>(`${EDU_API_AUTH_ENDPOINT}/${username}`);
          const qrcode = response.data;
          return qrcode;
        } catch (e) {
          handleApiError(e, set);
          return null;
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useUserStore;
