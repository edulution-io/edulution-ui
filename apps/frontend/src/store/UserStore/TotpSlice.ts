import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { StateCreator } from 'zustand';
import UserStore from '@libs/user/types/store/userStore';
import TotpSlice from '@libs/user/types/store/totpSlice';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';

const initialState = {
  totpError: null,
  totpIsLoading: false,
};

const createTotpSlice: StateCreator<UserStore, [], [], TotpSlice> = (set) => ({
  ...initialState,

  setupTotp: async (totp, secret) => {
    set({ totpIsLoading: true });
    try {
      await eduApi.post<boolean>(`${AUTH_PATHS.AUTH_ENDPOINT}/${AUTH_PATHS.AUTH_CHECK_TOTP}`, {
        totp,
        secret,
      });
    } catch (e) {
      handleApiError(e, set);
    } finally {
      set({ totpIsLoading: false });
    }
  },

  resetTotpSlice: () => set({ ...initialState }),
});

export default createTotpSlice;
