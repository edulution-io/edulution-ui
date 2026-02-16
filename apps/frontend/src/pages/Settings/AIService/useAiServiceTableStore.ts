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
import eduApi from '@/api/eduApi';
import { AI_SERVICE_EDU_API_ENDPOINT, AI_SERVICE_MODELS_ENDPOINT } from '@libs/aiService/constants/apiEndpoints';
import AiServiceResponseDto from '@libs/aiService/types/aiServiceResponseDto';
import CreateAiServiceDto from '@libs/aiService/types/createAiServiceDto';
import FetchAiModelsDto from '@libs/aiService/types/fetchAiModelsDto';
import handleApiError from '@/utils/handleApiError';
import { toast } from 'sonner';
import i18n from '@/i18n';

interface AiServiceTableStore {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  tableContentData: AiServiceResponseDto[];
  selectedAiService: AiServiceResponseDto | null;
  setSelectedAiService: (aiService: AiServiceResponseDto | null) => void;
  fetchTableContent: () => Promise<void>;
  addNewAiService: (aiService: CreateAiServiceDto) => Promise<void>;
  updateAiService: (id: string, aiService: CreateAiServiceDto) => Promise<void>;
  deleteAiService: (id: string) => Promise<void>;
  availableModels: string[];
  isModelsLoading: boolean;
  fetchAvailableModels: (request: FetchAiModelsDto) => Promise<void>;
  isDeleteDialogOpen: boolean;
  isDeleteDialogLoading: boolean;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  error: null | Error;
  reset: () => void;
}

const initialValues = {
  isDialogOpen: false,
  isLoading: false,
  selectedAiService: null,
  tableContentData: [],
  availableModels: [] as string[],
  isModelsLoading: false,
  isDeleteDialogOpen: false,
  isDeleteDialogLoading: false,
  error: null,
};

const useAiServiceTableStore = create<AiServiceTableStore>((set, get) => ({
  ...initialValues,
  setIsDialogOpen: (isOpen) => set({ isDialogOpen: isOpen }),
  setIsDeleteDialogOpen: (isOpen) => set({ isDeleteDialogOpen: isOpen }),
  setSelectedAiService: (aiService) => set({ selectedAiService: aiService }),

  fetchTableContent: async () => {
    if (get().isLoading) {
      return;
    }

    set({ error: null, isLoading: true });
    try {
      const response = await eduApi.get<AiServiceResponseDto[]>(AI_SERVICE_EDU_API_ENDPOINT);
      set({ tableContentData: response.data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  addNewAiService: async (aiService) => {
    set({ error: null, isLoading: true });
    try {
      await eduApi.post<AiServiceResponseDto>(AI_SERVICE_EDU_API_ENDPOINT, aiService);
      toast.success(i18n.t('settings.aiServices.createdSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  updateAiService: async (id, aiService) => {
    set({ error: null, isLoading: true });
    try {
      await eduApi.patch(`${AI_SERVICE_EDU_API_ENDPOINT}/${id}`, aiService);
      toast.success(i18n.t('settings.aiServices.updatedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAvailableModels: async (request) => {
    set({ isModelsLoading: true, availableModels: [] });
    try {
      const response = await eduApi.post<string[]>(AI_SERVICE_MODELS_ENDPOINT, request);
      set({ availableModels: response.data });
    } catch (error) {
      handleApiError(error, set);
      toast.error(i18n.t('settings.aiServices.fetchModelsFailed'));
    } finally {
      set({ isModelsLoading: false });
    }
  },

  deleteAiService: async (id) => {
    set({ error: null, isDeleteDialogLoading: true });
    try {
      await eduApi.delete(`${AI_SERVICE_EDU_API_ENDPOINT}/${id}`);
      toast.success(i18n.t('settings.aiServices.deletedSuccessfully'));
      set({ selectedAiService: null });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isDeleteDialogLoading: false });
    }
  },

  reset: () => set(initialValues),
}));

export default useAiServiceTableStore;
