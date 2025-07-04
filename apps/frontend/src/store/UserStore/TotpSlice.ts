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

import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { StateCreator } from 'zustand';
import UserStore from '@libs/user/types/store/userStore';
import TotpSlice from '@libs/user/types/store/totpSlice';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';
import UserDto from '@libs/user/types/user.dto';
import { toast } from 'sonner';
import i18n from '@/i18n';

const initialState = {
  totpError: null,
  totpIsLoading: false,
  isSetTotpDialogOpen: false,
};

const createTotpSlice: StateCreator<UserStore, [], [], TotpSlice> = (set) => ({
  ...initialState,

  setIsSetTotpDialogOpen: (isSetTotpDialogOpen) => set({ isSetTotpDialogOpen }),

  setupTotp: async (totp, secret) => {
    set({ totpIsLoading: true });
    try {
      const { data } = await eduApi.post<UserDto>(`${AUTH_PATHS.AUTH_ENDPOINT}/${AUTH_PATHS.AUTH_CHECK_TOTP}`, {
        totp,
        secret,
      });
      set({ user: { ...data } });
      return true;
    } catch (e) {
      handleApiError(e, set);
      return false;
    } finally {
      set({ totpIsLoading: false });
    }
  },

  getTotpStatus: async (username) => {
    if (!username) return false;
    set({ totpIsLoading: true });
    try {
      const { data } = await eduApi.get<boolean>(
        `${AUTH_PATHS.AUTH_ENDPOINT}/${AUTH_PATHS.AUTH_CHECK_TOTP}/${username}`,
      );

      if (typeof data === 'boolean') {
        return data;
      }

      return false;
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

  disableTotpForUser: async (username: string) => {
    set({ totpIsLoading: true });
    try {
      const { data } = await eduApi.put<{ success: boolean; status: number }>(
        `${AUTH_PATHS.AUTH_ENDPOINT}/${AUTH_PATHS.AUTH_CHECK_TOTP}/${username}`,
      );
      if (data.status === 200) {
        toast.success(i18n.t('settings.userAdministration.totpResetSuccess', { username }));
      }
    } catch (e) {
      handleApiError(e, set);
    } finally {
      set({ totpIsLoading: false });
    }
  },

  resetTotpSlice: () => set({ ...initialState }),
});

export default createTotpSlice;
