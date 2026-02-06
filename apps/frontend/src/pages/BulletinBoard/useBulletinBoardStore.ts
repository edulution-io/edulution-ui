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

import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import eduApi from '@/api/eduApi';
import { BULLETIN_BOARD_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import handleApiError from '@/utils/handleApiError';
import BulletinsByCategories from '@libs/bulletinBoard/types/bulletinsByCategories';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import UpdateBulletinCollapsedDto from '@libs/user-preferences/types/update-bulletin-collapsed.dto';
import UpdateBulletinBoardGridRowsDto from '@libs/user-preferences/types/update-bulletin-board-grid-rows.dto';
import USER_PREFERENCES_ENDPOINT from '@libs/user-preferences/constants/user-preferences-endpoint';
import BULLETIN_BOARD_GRID_ROWS from '@libs/bulletinBoard/constants/bulletin-board-grid-rows';

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
  gridRows: string;
  setGridRows: (gridRows: string) => Promise<void>;
  hydrateGridRows: (gridRows: string) => void;
}

type PersistedBulletinBoardStore = (
  config: StateCreator<BulletinBoardTableStore>,
  options: PersistOptions<Partial<BulletinBoardTableStore>>,
) => StateCreator<BulletinBoardTableStore>;

const initialValues = {
  isLoading: false,
  error: null,
  bulletinsByCategories: null,
  isEditorialModeEnabled: false,
  bulletinBoardNotifications: [],
  collapsedMap: {},
  gridRows: BULLETIN_BOARD_GRID_ROWS.ONE,
};

const useBulletinBoardStore = create<BulletinBoardTableStore>(
  (persist as PersistedBulletinBoardStore)(
    (set, get) => ({
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

      hydrateGridRows: (gridRows) => set({ gridRows: gridRows ?? BULLETIN_BOARD_GRID_ROWS.ONE }),

      setGridRows: async (gridRows) => {
        const previousGridRows = get().gridRows;
        set({ gridRows });

        try {
          const dto: UpdateBulletinBoardGridRowsDto = { gridRows };
          await eduApi.patch(`${USER_PREFERENCES_ENDPOINT}/bulletin-board-grid-rows`, dto);
        } catch (error) {
          set({ gridRows: previousGridRows });
        }
      },

      setIsEditorialModeEnabled: (isEditorialModeEnabled) => set({ isEditorialModeEnabled }),

      addBulletinBoardNotification: (bulletin) =>
        set({
          bulletinBoardNotifications: [
            ...get().bulletinBoardNotifications.filter((b) => b.id !== bulletin.id),
            bulletin,
          ],
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
    }),
    {
      name: 'bulletin-board',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gridRows: state.gridRows,
        collapsedMap: state.collapsedMap,
      }),
    },
  ),
);

export default useBulletinBoardStore;
