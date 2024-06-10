import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import EDU_API_AUTH_ENDPOINT from '@/api/endpoints/auth';
import useUserStore from '@/store/userStore';

type TotpStore = {
  checkTotp: (otp: string) => Promise<void>;
  setupTotp: (otp: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
};

const initialState = {
  error: null,
  isLoading: false,
};

type PersistedUserStore = (
  userData: StateCreator<TotpStore>,
  options: PersistOptions<TotpStore>,
) => StateCreator<TotpStore>;

const useTotpStore = create<TotpStore>(
  (persist as PersistedUserStore)(
    (set) => ({
      ...initialState,

      checkTotp: async (otp) => {
        set({ isLoading: true });
        try {
          const response = await eduApi.post(EDU_API_AUTH_ENDPOINT, { totpToken: otp });
          const isTotpValid = response.status === 201;

          const { setIsAuthenticated } = useUserStore();
          setIsAuthenticated(isTotpValid);
          set({ isLoading: false });
        } catch (e) {
          handleApiError(e, set);
        }
      },

      setupTotp: async (otp) => {
        set({ isLoading: true });
        try {
          await eduApi.post<boolean>(EDU_API_AUTH_ENDPOINT, { totpToken: otp });
          set({ isLoading: false });
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

export default useTotpStore;
