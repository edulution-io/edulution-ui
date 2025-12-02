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
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import type AiConfigTableStore from '@libs/ai/types/aiConfigTableStore';
import { AI_CONFIGS_EDU_API_ENDPOINT } from '@libs/ai/constants/aiEndpoints';
import eduApi from '@/api/eduApi';

const initialValues = {
  tableContentData: [] as AiConfigDto[],
  selectedConfig: null,
  isLoading: false,
  error: null,
  selectedRows: {},
};

const useAiConfigTableStore = create<AiConfigTableStore>((set, get) => ({
  ...initialValues,

  setSelectedConfig: (config) => set({ selectedConfig: config }),
  setSelectedRows: (rows) => set({ selectedRows: rows }),

  fetchTableContent: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<AiConfigDto[]>(AI_CONFIGS_EDU_API_ENDPOINT);
      set({ tableContentData: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch AI configs';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteTableEntry: async (_applicationName: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      await eduApi.delete(`${AI_CONFIGS_EDU_API_ENDPOINT}/${id}`);
      const { tableContentData } = get();
      set({
        tableContentData: tableContentData.filter((c) => c.id !== id),
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete AI config';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  addOrUpdateConfig: async (config: AiConfigDto) => {
    set({ isLoading: true, error: null });
    try {
      const { tableContentData } = get();
      const isUpdate = config.id && config.id !== '' && tableContentData.some((c) => c.id === config.id);

      let savedConfig: AiConfigDto;
      if (isUpdate) {
        const response = await eduApi.put<AiConfigDto>(`${AI_CONFIGS_EDU_API_ENDPOINT}/${config.id}`, config);
        savedConfig = response.data;
        set({
          tableContentData: tableContentData.map((c) => (c.id === savedConfig.id ? savedConfig : c)),
          isLoading: false,
        });
      } else {
        const { ...createDto } = config;
        const response = await eduApi.post<AiConfigDto>(AI_CONFIGS_EDU_API_ENDPOINT, createDto);
        savedConfig = response.data;
        set({
          tableContentData: [...tableContentData, savedConfig],
          isLoading: false,
        });
      }

      return savedConfig;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save AI config';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
}));

export default useAiConfigTableStore;
