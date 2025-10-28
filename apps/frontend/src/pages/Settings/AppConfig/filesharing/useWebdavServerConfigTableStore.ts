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
import { WebdavServerTableStore } from '@libs/appconfig/types/webdavShareTableStore';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import useWebdavShareConfigTableStore from './useWebdavShareConfigTableStore';

const initialValues = {
  selectedRows: {},
  isLoading: false,
  tableContentData: [],
  selectedConfig: null,
  isDeleteWebdavServerWarningDialogOpen: undefined,
};

const useWebdavServerConfigTableStore: UseBoundStore<StoreApi<WebdavServerTableStore>> = create<WebdavServerTableStore>(
  (set, get) => ({
    ...initialValues,

    setSelectedRows: (selectedRows) => set({ selectedRows }),

    setSelectedConfig: (config) => set({ selectedConfig: config }),

    setIsDeleteWebdavServerWarningDialogOpen: (open) => set({ isDeleteWebdavServerWarningDialogOpen: open }),

    fetchTableContent: async () => {
      try {
        const { data } = await eduApi.get<WebdavShareDto[]>('/webdav-shares', { params: { isRootServer: true } });
        set({
          tableContentData: data,
        });
      } catch (error) {
        handleApiError(error, set);
      }
    },

    deleteTableEntry: async (_applicationName, webdavShareId) => {
      const { tableContentData: webdavShares } = useWebdavShareConfigTableStore.getState();
      const dependentShares = webdavShares.filter((share) => share.rootServer === webdavShareId);
      if (dependentShares.length > 0) {
        get().setIsDeleteWebdavServerWarningDialogOpen(webdavShareId);
        return;
      }
      set({ isLoading: true });
      try {
        await eduApi.delete(`/webdav-shares/${webdavShareId}`, { params: { isRootServer: true } });
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

export default useWebdavServerConfigTableStore;
