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
  itemToDelete: null,
};

const useWebdavShareConfigTableStore: UseBoundStore<StoreApi<WebdavShareTableStore>> = create<WebdavShareTableStore>(
  (set) => ({
    ...initialValues,

    setSelectedRows: (selectedRows) => set({ selectedRows }),

    setSelectedConfig: (config) => set({ selectedConfig: config }),

    setItemToDelete: (item) => set({ itemToDelete: item }),

    fetchTableContent: async () => {
      try {
        const { data } = await eduApi.get<WebdavShareDto[]>('/webdav-shares', { params: { isRootServer: false } });
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
