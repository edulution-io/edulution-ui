import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { StateCreator } from 'zustand';
import UserStore from '@libs/user/types/store/userStore';
import TotpSlice from '@libs/user/types/store/totpSlice';
import AUTH_PATHS from '@libs/auth/auth-endpoints';

const initialState = {
  totpError: null,
  totpIsLoading: false,
};

const createTotpSlice: StateCreator<UserStore, [], [], TotpSlice> = (set, get) => ({
  ...initialState,

  checkTotp: async (otp) => {
    set({ totpIsLoading: true });
    try {
      const response = await eduApi.post(AUTH_PATHS.AUTH_ENDPOINT, { totpToken: otp });
      const isTotpValid = response.status === 201;

      const { setIsAuthenticated } = get();
      setIsAuthenticated(isTotpValid);
    } catch (e) {
      handleApiError(e, set, 'totpError');
    } finally {
      set({ totpIsLoading: false });
    }
  },

  setupTotp: async (otp) => {
    set({ totpIsLoading: true });
    try {
      await eduApi.post<boolean>(AUTH_PATHS.AUTH_ENDPOINT, { totpToken: otp });
    } catch (e) {
      handleApiError(e, set, 'totpError');
    } finally {
      set({ totpIsLoading: false });
    }
  },

  resetTotpSlice: () => set({ ...initialState }),
});

export default createTotpSlice;
