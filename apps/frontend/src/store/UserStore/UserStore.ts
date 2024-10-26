import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import UserStore from '@libs/user/types/store/userStore';
import createUserSlice from './UserSlice';
import createTotpSlice from './TotpSlice';
import createQrCodeSlice from './QrCodeSlice';

const useUserStore = create<UserStore>()(
  persist(
    (set, get, store) => ({
      ...createUserSlice(set, get, store),
      ...createTotpSlice(set, get, store),
      ...createQrCodeSlice(set, get, store),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isPreparingLogout: state.isPreparingLogout,
        eduApiToken: state.eduApiToken,
        user: state.user,
      }),
    },
  ),
);

export default useUserStore;
