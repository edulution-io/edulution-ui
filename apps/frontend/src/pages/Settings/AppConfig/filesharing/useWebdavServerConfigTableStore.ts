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
  itemToDelete: null,
};

const useWebdavServerConfigTableStore: UseBoundStore<StoreApi<WebdavServerTableStore>> = create<WebdavServerTableStore>(
  (set, get) => ({
    ...initialValues,

    setSelectedRows: (selectedRows) => set({ selectedRows }),

    setSelectedConfig: (config) => set({ selectedConfig: config }),

    setItemToDelete: (item) => set({ itemToDelete: item }),

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
