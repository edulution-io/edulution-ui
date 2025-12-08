/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { StateCreator } from 'zustand';
import UserStore from '@libs/user/types/store/userStore';
import TotpSlice from '@libs/user/types/store/totpSlice';
import AUTH_PATHS from '@libs/auth/constants/auth-paths';
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
