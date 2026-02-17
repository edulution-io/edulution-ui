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
import AI_ASSISTANT_EDU_API_ENDPOINT from '@libs/aiAssistant/constants/aiAssistantEduApiEndpoint';
import AiAssistantResponseDto from '@libs/aiAssistant/types/aiAssistantResponseDto';
import handleApiError from '@/utils/handleApiError';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { AiAssistantTableStore } from '@libs/appconfig/types/aiAssistantTableStore';

const initialValues = {
  isDialogOpen: false,
  isLoading: false,
  selectedAssistant: null,
  isNameCheckingLoading: false,
  tableContentData: [],
  nameExistsAlready: false,
  isDeleteDialogOpen: false,
  isDeleteDialogLoading: false,
  error: null,
};

const useAiAssistantTableStore: UseBoundStore<StoreApi<AiAssistantTableStore>> = create<AiAssistantTableStore>(
  (set, get) => ({
    ...initialValues,
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsDialogOpen: (isOpen) => set({ isDialogOpen: isOpen }),
    setIsDeleteDialogOpen: (isOpen) => set({ isDeleteDialogOpen: isOpen }),

    addNewAssistant: async (assistant) => {
      set({ error: null, isLoading: true });
      try {
        await eduApi.post<AiAssistantResponseDto[]>(AI_ASSISTANT_EDU_API_ENDPOINT, assistant);
        toast.success(i18n.t('chat.assistant.assistantCreatedSuccessfully'));
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isLoading: false });
      }
    },

    setSelectedAssistant: (assistant) => set({ selectedAssistant: assistant }),

    fetchTableContent: async () => {
      if (get().isLoading) {
        return;
      }

      set({ error: null, isLoading: true });
      try {
        const response = await eduApi.get<AiAssistantResponseDto[]>(AI_ASSISTANT_EDU_API_ENDPOINT);
        set({ tableContentData: response.data });
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isLoading: false });
      }
    },

    checkIfNameAllReadyExists: async (name): Promise<void> => {
      try {
        set({ isNameCheckingLoading: true });
        const response = await eduApi.get<{ exists: boolean }>(`${AI_ASSISTANT_EDU_API_ENDPOINT}/${name}`);
        set({ nameExistsAlready: response.data.exists });
      } catch (error) {
        set({ nameExistsAlready: true });
      } finally {
        set({ isNameCheckingLoading: false });
      }
    },

    updateAssistant: async (id, assistant) => {
      set({ error: null, isLoading: true });
      try {
        await eduApi.patch(`${AI_ASSISTANT_EDU_API_ENDPOINT}/${id}`, assistant);
        toast.success(i18n.t('chat.assistant.assistantUpdatedSuccessfully'));
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isLoading: false });
      }
    },

    deleteAssistant: async (id) => {
      set({ error: null, isDeleteDialogLoading: true });
      try {
        await eduApi.delete(`${AI_ASSISTANT_EDU_API_ENDPOINT}/${id}`);
        toast.success(i18n.t('chat.assistant.assistantDeletedSuccessfully'));
        set({ selectedAssistant: null });
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isDeleteDialogLoading: false });
      }
    },

    reset: () => set(initialValues),
  }),
);

export default useAiAssistantTableStore;
