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

import { create, StoreApi, UseBoundStore } from 'zustand';
import { WebdavShareTableStore } from '@libs/appconfig/types/webdavShareTableStore';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';

const initialValues = {
  selectedRows: {},
  isLoading: false,
  tableContentData: [],
  selectedConfig: null,
};

const useWebdavShareConfigTableStore: UseBoundStore<StoreApi<WebdavShareTableStore>> = create<WebdavShareTableStore>(
  (set) => ({
    ...initialValues,

    setSelectedRows: (selectedRows) => set({ selectedRows }),

    setSelectedConfig: (config) => set({ selectedConfig: config }),

    fetchTableContent: async () => {
      try {
        const { data } = await eduApi.get<WebdavShareDto[]>('/webdav-shares');
        set({
          tableContentData: data,
        });
      } catch (error) {
        handleApiError(error, set);
      }
    },

    createWebdavShare: async (webdavShareDto: WebdavShareDto) => {
      set({ isLoading: true });
      try {
        await eduApi.post('/webdav-shares', webdavShareDto);
        set({ isLoading: false });
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isLoading: false });
      }
    },

    updateWebdavShare: async (webdavShareId, webdavShareDto) => {
      set({ isLoading: true });
      try {
        await eduApi.put<WebdavShareDto[]>(`/webdav-shares/${webdavShareId}`, webdavShareDto);
        set({ isLoading: false });
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isLoading: false });
      }
    },

    deleteTableEntry: async (_applicationName, webdavShareId) => {
      set({ isLoading: true });
      try {
        await eduApi.delete(`/webdav-shares/${webdavShareId}`);
        set({ isLoading: false });
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isLoading: false });
      }
    },

    reset: () => set(initialValues),
  }),
);

export default useWebdavShareConfigTableStore;
