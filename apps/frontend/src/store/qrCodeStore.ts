import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import EDU_API_AUTH_ENDPOINT from '@/api/endpoints/auth';

type QrCodeStore = {
  qrCode: string;
  getQrCode: (username: string, isLoading?: boolean) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
};

const initialState = {
  qrCode: '',
  error: null,
  isLoading: false,
};

type PersistedUserStore = (
  userData: StateCreator<QrCodeStore>,
  options: PersistOptions<QrCodeStore>,
) => StateCreator<QrCodeStore>;

const useQrCodeStore = create<QrCodeStore>(
  (persist as PersistedUserStore)(
    (set) => ({
      ...initialState,

      getQrCode: async (username, setIsLoading = true) => {
        set({ isLoading: setIsLoading });
        try {
          const response = await eduApi.get<string>(`${EDU_API_AUTH_ENDPOINT}/${username}`);
          set({ qrCode: response.data });
        } catch (e) {
          handleApiError(e, set);
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

export default useQrCodeStore;
