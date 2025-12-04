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

import { create } from 'zustand';
import { type FileTableStore } from '@libs/appconfig/types/fileTableStore';
import eduApi from '@/api/eduApi';
import FileInfoDto from '@libs/appconfig/types/fileInfo.dto';
import handleApiError from '@/utils/handleApiError';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';

const initialValues = {
  publicFilesInfo: [],
  tableContentData: [],
  isLoading: true,
  error: null,
  selectedRows: {},
  files: {},
};

const useFileTableStore = create<FileTableStore>((set) => ({
  ...initialValues,

  setSelectedRows: (selectedRows) => set({ selectedRows }),

  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  fetchTableContent: async (applicationName) => {
    set({ isLoading: true });
    try {
      const { data } = await eduApi.get<FileInfoDto[]>(`${EDU_API_CONFIG_ENDPOINTS.FILES}/info/${applicationName}`);

      set({ tableContentData: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  getPublicFilesInfo: async (applicationName) => {
    set({ isLoading: true });
    try {
      const { data } = await eduApi.get<FileInfoDto[]>(
        `${EDU_API_CONFIG_ENDPOINTS.FILES}/public/info/${applicationName}`,
      );
      set({ publicFilesInfo: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTableEntry: async (applicationName, fileName) => {
    set({ isLoading: true, error: null });
    try {
      await eduApi.delete(`${EDU_API_CONFIG_ENDPOINTS.FILES}/${applicationName}/${fileName}`);
    } catch (e) {
      handleApiError(e, set);
    } finally {
      set({ isLoading: false });
    }
  },
  reset: () => set(initialValues),
}));

export default useFileTableStore;
