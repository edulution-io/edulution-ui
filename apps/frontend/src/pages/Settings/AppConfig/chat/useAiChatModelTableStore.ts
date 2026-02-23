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
import eduApi from '@/api/eduApi';
import AiChatModelResponseDto from '@libs/aiChatModel/types/aiChatModelResponseDto';
import AI_CHAT_MODEL_EDU_API_ENDPOINT from '@libs/aiChatModel/constants/aiChatModelEduApiEndpoint';
import { AI_SERVICE_EDU_API_ENDPOINT } from '@libs/aiService/constants/apiEndpoints';
import handleApiError from '@/utils/handleApiError';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { AiChatModelTableStore } from '@libs/appconfig/types/aiChatModelTableStore';

const initialValues = {
  isLoading: false,
  selectedModel: null,
  tableContentData: [],
  isDeleteDialogOpen: false,
  isDeleteDialogLoading: false,
  error: null,
  aiServiceOptions: [],
};

const useAiChatModelTableStore: UseBoundStore<StoreApi<AiChatModelTableStore>> = create<AiChatModelTableStore>(
  (set, get) => ({
    ...initialValues,
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsDeleteDialogOpen: (isOpen) => set({ isDeleteDialogOpen: isOpen }),

    addNewModel: async (model) => {
      set({ error: null, isLoading: true });
      try {
        await eduApi.post<AiChatModelResponseDto>(AI_CHAT_MODEL_EDU_API_ENDPOINT, model);
        toast.success(i18n.t('chat.aiChatModel.createdSuccessfully'));
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isLoading: false });
      }
    },

    setSelectedModel: (model) => set({ selectedModel: model }),

    fetchTableContent: async () => {
      if (get().isLoading) {
        return;
      }

      set({ error: null, isLoading: true });
      try {
        const response = await eduApi.get<AiChatModelResponseDto[]>(AI_CHAT_MODEL_EDU_API_ENDPOINT);
        set({ tableContentData: response.data });
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isLoading: false });
      }
    },

    updateModel: async (id, model) => {
      set({ error: null, isLoading: true });
      try {
        await eduApi.patch(`${AI_CHAT_MODEL_EDU_API_ENDPOINT}/${id}`, model);
        toast.success(i18n.t('chat.aiChatModel.updatedSuccessfully'));
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isLoading: false });
      }
    },

    deleteModel: async (id) => {
      set({ error: null, isDeleteDialogLoading: true });
      try {
        await eduApi.delete(`${AI_CHAT_MODEL_EDU_API_ENDPOINT}/${id}`);
        toast.success(i18n.t('chat.aiChatModel.deletedSuccessfully'));
        set({ selectedModel: null });
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isDeleteDialogLoading: false });
      }
    },

    fetchAiServiceOptions: async () => {
      try {
        const response = await eduApi.get<{ id: string; name: string }[]>(AI_SERVICE_EDU_API_ENDPOINT);
        set({ aiServiceOptions: response.data.map((service) => ({ id: service.id, name: service.name })) });
      } catch (error) {
        handleApiError(error, set);
      }
    },

    reset: () => set(initialValues),
  }),
);

export default useAiChatModelTableStore;
