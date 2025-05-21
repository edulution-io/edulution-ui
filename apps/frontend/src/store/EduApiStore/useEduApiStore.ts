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
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import handleApiError from '@/utils/handleApiError';
import { HttpStatusCode } from 'axios';

type EduApiStore = {
  isEduApiHealthyLoading: boolean;
  error: Error | null;
  getIsEduApiHealthy: () => Promise<boolean>;
};

const initialState = {
  isEduApiHealthyLoading: false,
  error: null,
};

const useEduApiStore = create<EduApiStore>((set) => ({
  ...initialState,

  getIsEduApiHealthy: async () => {
    set({ isEduApiHealthyLoading: true });
    try {
      const response = await eduApi.get<void>(EDU_API_CONFIG_ENDPOINTS.HEALTH_CHECK);
      return response.status === Number(HttpStatusCode.Ok);
    } catch (e) {
      handleApiError(e, set);
      return false;
    } finally {
      set({ isEduApiHealthyLoading: false });
    }
  },
}));
export default useEduApiStore;
