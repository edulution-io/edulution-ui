/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import UserStore from '@libs/user/types/store/userStore';
import createUserSlice from './UserSlice';
import createTotpSlice from './TotpSlice';
import createQrCodeSlice from './QrCodeSlice';
import createUserAccountsSlice from './UserAccountsSlice';

const useUserStore = create<UserStore>()(
  persist(
    (set, get, store) => ({
      ...createUserSlice(set, get, store),
      ...createTotpSlice(set, get, store),
      ...createQrCodeSlice(set, get, store),
      ...createUserAccountsSlice(set, get, store),
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
