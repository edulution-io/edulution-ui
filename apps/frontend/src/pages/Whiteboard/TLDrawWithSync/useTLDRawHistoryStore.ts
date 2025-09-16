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
import HistoryPageDto from '@libs/whiteboard/types/historyPageDto';
import HistoryEntryDto from '@libs/whiteboard/types/historyEntryDto';
import eduApi from '@/api/eduApi';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/tLDrawSyncEndpoints';
import handleApiError from '@/utils/handleApiError';
import TLDRAW_MULTI_USER_ROOM_PREFIX from '@libs/whiteboard/constants/tldrawMultiUserRoomPrefix';

interface TLDRawHistoryStore {
  reset: () => void;
  selectedRoomId: string;
  setSelectedRoomId: (roomId: string) => void;
  currentRoomHistory: HistoryPageDto | null;
  isHistoryLoading: boolean;
  historyHasMoreItemsToLoad: boolean;
  initRoomHistory: (roomId: string, limit?: number) => Promise<void>;
  fetchNextHistoryPage: (limit?: number) => Promise<void>;
  addRoomHistoryEntry: (entry: HistoryEntryDto) => void;
  fetchRoomHistoryPage: (roomId: string, page?: number, limit?: number) => Promise<HistoryPageDto | null>;
}

const initialState = {
  selectedRoomId: '',
  currentRoomHistory: null,
  isHistoryLoading: false,
  historyHasMoreItemsToLoad: false,
};

const dedupeAndSort = (items: HistoryEntryDto[]): HistoryEntryDto[] => {
  const map = new Map<string, HistoryEntryDto>();

  items.forEach((it) => {
    if (!map.has(it.id)) {
      map.set(it.id, it);
    }
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const useTLDRawHistoryStore = create<TLDRawHistoryStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      reset: () => set(initialState),

      setSelectedRoomId: (roomId) => {
        if (get().selectedRoomId === roomId) return;
        set({ selectedRoomId: roomId });
      },

      fetchRoomHistoryPage: async (roomId, page = 1, limit = 5) => {
        try {
          const { data } = await eduApi.get<HistoryPageDto>(
            `${TLDRAW_SYNC_ENDPOINTS.BASE}/${TLDRAW_SYNC_ENDPOINTS.HISTORY}/${roomId}`,
            { params: { page, limit } },
          );
          return data;
        } catch (error) {
          handleApiError(error, set);
          return null;
        }
      },

      initRoomHistory: async (roomId, limit = 5) => {
        set({
          currentRoomHistory: null,
          isHistoryLoading: true,
          historyHasMoreItemsToLoad: false,
        });

        if (!roomId) {
          set({ isHistoryLoading: false });
          return;
        }

        const data = await get().fetchRoomHistoryPage(roomId, 1, limit);
        if (data) {
          const uniqueItems = dedupeAndSort(data.items);
          set({
            currentRoomHistory: {
              ...data,
              items: uniqueItems,
            },
            historyHasMoreItemsToLoad: uniqueItems.length < data.total,
          });
        }

        set({ isHistoryLoading: false });
      },

      fetchNextHistoryPage: async (limit = 5) => {
        const state = get();
        const roomId = state.selectedRoomId;
        const current = state.currentRoomHistory;
        if (!roomId || !current || state.isHistoryLoading) return;

        const nextPage = current.page + 1;
        set({ isHistoryLoading: true });

        const data = await get().fetchRoomHistoryPage(roomId, nextPage, limit);
        if (data) {
          const combined = dedupeAndSort([...current.items, ...data.items]);
          set({
            currentRoomHistory: {
              roomId: data.roomId,
              page: data.page,
              limit: data.limit,
              total: data.total,
              items: combined,
            },
            historyHasMoreItemsToLoad: combined.length < data.total,
          });
        }

        set({ isHistoryLoading: false });
      },

      addRoomHistoryEntry: (entry) => {
        const state = get();
        const current = state.currentRoomHistory;
        if (!current || entry.roomId !== TLDRAW_MULTI_USER_ROOM_PREFIX + state.selectedRoomId) return;

        const alreadyExists = current.items.some((i) => i.id === entry.id);
        const items = alreadyExists ? current.items : [entry, ...current.items];
        const uniqueItems = alreadyExists ? items : dedupeAndSort(items);

        set({
          currentRoomHistory: {
            roomId: current.roomId,
            page: current.page,
            limit: current.limit,
            total: alreadyExists ? current.total : current.total + 1,
            items: uniqueItems,
          },
          historyHasMoreItemsToLoad: uniqueItems.length < current.total,
        });
      },
    }),
    {
      name: 'tldraw-sync-history',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedRoomId: state.selectedRoomId,
      }),
    },
  ),
);

export default useTLDRawHistoryStore;
