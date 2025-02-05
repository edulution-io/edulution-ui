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
import { BULLETIN_BOARD_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import handleApiError from '@/utils/handleApiError';
import BulletinsByCategories from '@libs/bulletinBoard/types/bulletinsByCategories';

export interface BulletinBoardTableStore {
  reset: () => void;
  isLoading: boolean;
  error: Error | null;
  getBulletinsByCategories: () => Promise<void>;
  bulletinsByCategories: BulletinsByCategories | null;
}

const initialValues = {
  isLoading: false,
  error: null,
  bulletinsByCategories: null,
};

const useBulletinBoardStore = create<BulletinBoardTableStore>((set, get) => ({
  ...initialValues,
  reset: () => set(initialValues),

  getBulletinsByCategories: async (isLoading = true) => {
    if (get().isLoading) return;
    set({ isLoading, error: null });
    try {
      const { data } = await eduApi.get<BulletinsByCategories>(BULLETIN_BOARD_EDU_API_ENDPOINT);
      set({ bulletinsByCategories: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useBulletinBoardStore;
