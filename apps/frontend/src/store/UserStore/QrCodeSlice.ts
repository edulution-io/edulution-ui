import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { StateCreator } from 'zustand';
import QrCodeSlice from '@libs/user/types/store/qrCodeSlice';
import UserStore from '@libs/user/types/store/userStore';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';

const initialState = {
  qrCode: '',
  qrCodeIsLoading: false,
  qrCodeError: null,
};

const createQrCodeSlice: StateCreator<UserStore, [], [], QrCodeSlice> = (set) => ({
  ...initialState,

  getQrCode: async () => {
    set({ qrCodeIsLoading: true });
    try {
      const { data: qrCode } = await eduApi.get<string>(`${AUTH_PATHS.AUTH_ENDPOINT}/${AUTH_PATHS.AUTH_QRCODE}`);
      set({ qrCode });
    } catch (e) {
      handleApiError(e, set);
    } finally {
      set({ qrCodeIsLoading: false });
    }
  },

  resetQrCodeSlice: () => set({ ...initialState }),
});

export default createQrCodeSlice;
