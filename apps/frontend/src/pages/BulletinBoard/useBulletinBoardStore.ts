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
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import UpdateBulletinCollapsedDto from '@libs/user-preferences/types/update-bulletin-collapsed.dto';
import USER_PREFERENCES_ENDPOINT from '@libs/user-preferences/constants/user-preferences-endpoint';

export interface BulletinBoardTableStore {
  reset: () => void;
  isLoading: boolean;
  error: Error | null;
  collapsedMap: Record<string, boolean>;
  setCollapsed: (bulletinId: string, collapsed: boolean) => Promise<void>;
  toggleCollapsed: (bulletinId: string) => void;
  hydrateCollapsed: (map: Record<string, boolean>) => void;
  getBulletinsByCategories: (isLoading?: boolean) => Promise<void>;
  bulletinsByCategories: BulletinsByCategories | null;
  isEditorialModeEnabled: boolean;
  setIsEditorialModeEnabled: (isEditorialModeEnabled: boolean) => void;
  bulletinBoardNotifications: BulletinResponseDto[];
  addBulletinBoardNotification: (bulletin: BulletinResponseDto) => void;
  markBulletinAsRead: (bulletinId: string) => void;
}

const initialValues = {
  isLoading: false,
  error: null,
  bulletinsByCategories: null,
  isEditorialModeEnabled: false,
  bulletinBoardNotifications: [],
  collapsedMap: {},
};

const useBulletinBoardStore = create<BulletinBoardTableStore>((set, get) => ({
  ...initialValues,
  reset: () => set(initialValues),

  setCollapsed: async (bulletinId, collapsed) => {
    set((state) => ({
      collapsedMap: { ...state.collapsedMap, [bulletinId]: collapsed },
    }));

    try {
      const dto: UpdateBulletinCollapsedDto = { bulletinId, collapsed };
      await eduApi.patch(`${USER_PREFERENCES_ENDPOINT}/bulletin-collapsed`, dto);
    } catch (error) {
      set((state) => ({
        collapsedMap: { ...state.collapsedMap, [bulletinId]: !collapsed },
      }));
    }
  },

  toggleCollapsed: (bulletinId) => {
    const current = get().collapsedMap[bulletinId];
    void get().setCollapsed(bulletinId, !current);
  },

  hydrateCollapsed: (map) => set({ collapsedMap: map ?? {} }),

  setIsEditorialModeEnabled: (isEditorialModeEnabled) => set({ isEditorialModeEnabled }),

  addBulletinBoardNotification: (bulletin) =>
    set({
      bulletinBoardNotifications: [...get().bulletinBoardNotifications.filter((b) => b.id !== bulletin.id), bulletin],
    }),

  markBulletinAsRead: (bulletinId) =>
    set({
      bulletinBoardNotifications: get().bulletinBoardNotifications.filter((b) => b.id !== bulletinId),
    }),

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
