import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { StateCreator } from 'zustand';
import UserStore from '@libs/user/types/store/userStore';
import TotpSlice from '@libs/user/types/store/totpSlice';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';
import UserDto from '@libs/user/types/user.dto';

const initialState = {
  totpError: null,
  totpIsLoading: false,
};

const createTotpSlice: StateCreator<UserStore, [], [], TotpSlice> = (set) => ({
  ...initialState,

  setupTotp: async (totp, secret) => {
    set({ totpIsLoading: true });
    try {
      const { data } = await eduApi.post<UserDto>(`${AUTH_PATHS.AUTH_ENDPOINT}/${AUTH_PATHS.AUTH_CHECK_TOTP}`, {
        totp,
        secret,
      });
      set({ user: { ...data } });
    } catch (e) {
      handleApiError(e, set);
    } finally {
      set({ totpIsLoading: false });
    }
  },

  getTotpStatus: async (username) => {
    set({ totpIsLoading: true });
    try {
      const { data } = await eduApi.get<boolean>(
        `${AUTH_PATHS.AUTH_ENDPOINT}/${AUTH_PATHS.AUTH_CHECK_TOTP}/${username}`,
      );
      return data;
    } catch (e) {
      handleApiError(e, set);
      return false;
    } finally {
      set({ totpIsLoading: false });
    }
  },

  disableTotp: async () => {
    set({ totpIsLoading: true });
    try {
      const { data } = await eduApi.put<UserDto>(`${AUTH_PATHS.AUTH_ENDPOINT}/${AUTH_PATHS.AUTH_CHECK_TOTP}`);
      set({ user: { ...data } });
    } catch (e) {
      handleApiError(e, set);
    } finally {
      set({ totpIsLoading: false });
    }
  },

  resetTotpSlice: () => set({ ...initialState }),
});

export default createTotpSlice;
