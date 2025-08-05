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
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/eduApiEndpoints';
import LmnApiStore from '@libs/lmnApi/types/lmnApiStore';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import { encodeBase64 } from '@libs/common/utils/getBase64String';

const { CHANGE_PASSWORD, FIRST_PASSWORD } = LMN_API_EDU_API_ENDPOINTS;

const initialState = {
  isLoading: false,
  error: null,
  currentUser: null,
};

const useLmnApiPasswordStore = create<LmnApiStore>((set) => ({
  ...initialState,

  setCurrentUser(currentUser) {
    set({ currentUser });
  },

  setFirstPassword: async (username, password) => {
    set({ error: null, isLoading: true });
    try {
      const { lmnApiToken } = useLmnApiStore.getState();
      await eduApi.put(
        FIRST_PASSWORD,
        {
          username,
          password: encodeBase64(password),
        },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      toast.success(i18n.t('classmanagement.firstPasswordChangedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentPassword: async (username, password) => {
    set({ error: null, isLoading: true });
    try {
      const { lmnApiToken } = useLmnApiStore.getState();
      await eduApi.post(
        CHANGE_PASSWORD,
        {
          username,
          password: encodeBase64(password),
        },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );
      toast.success(i18n.t('classmanagement.currentPasswordChangedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ ...initialState }),
}));

export default useLmnApiPasswordStore;
