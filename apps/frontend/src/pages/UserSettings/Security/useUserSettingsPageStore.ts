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
import eduApi from '@libs/common/constants/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/eduApiEndpoints';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import UserSettingsPageStore from '@libs/userSettings/constants/userSettingsPageStore';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';

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
          oldPassword: btoa(oldPassword),
          newPassword: btoa(newPassword),
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
