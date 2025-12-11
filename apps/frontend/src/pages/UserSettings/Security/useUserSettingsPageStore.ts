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

import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/lmnApiEduApiEndpoints';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import UserSettingsPageStore from '@libs/userSettings/constants/userSettingsPageStore';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import { encodeBase64 } from '@libs/common/utils/getBase64String';

const initialState = {
  isLoading: false,
  error: null,
};

const useUserSettingsPageStore = create<UserSettingsPageStore>((set) => ({
  ...initialState,

  changePassword: async (oldPassword, newPassword) => {
    set({ error: null, isLoading: true });
    try {
      const { lmnApiToken } = useLmnApiStore.getState();
      await eduApi.put<LmnApiSession>(
        LMN_API_EDU_API_ENDPOINTS.CHANGE_PASSWORD,
        {
          oldPassword: encodeBase64(oldPassword),
          newPassword: encodeBase64(newPassword),
        },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );

      toast.success(i18n.t('usersettings.security.changePassword.passwordChangedSuccessfully'));
      return true;
    } catch (error) {
      handleApiError(error, set);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ ...initialState }),
}));
export default useUserSettingsPageStore;
