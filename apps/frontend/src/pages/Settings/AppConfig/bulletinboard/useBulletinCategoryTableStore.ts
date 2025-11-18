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
import {
  BULLETIN_BOARD_EDU_API_ENDPOINT,
  BULLETIN_CATEGORY_EDU_API_ENDPOINT,
  BULLETIN_CATEGORY_POSITION_EDU_API_ENDPOINT,
  BULLETIN_CATEGORY_WITH_PERMISSION_EDU_API_ENDPOINT,
} from '@libs/bulletinBoard/constants/apiEndpoints';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import handleApiError from '@/utils/handleApiError';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { BulletinCategoryTableStore } from '@libs/appconfig/types/bulletinCategoryTableStore';
import BulletinCategoryPermission from '@libs/appconfig/constants/bulletinCategoryPermission';

const initialValues = {
  isDialogOpen: false,
  isLoading: false,
  selectedCategory: null,
  isNameCheckingLoading: false,
  tableContentData: [],
  nameExistsAlready: false,
  isDeleteDialogOpen: false,
  isDeleteDialogLoading: false,
  isCategoryPositionLoading: false,
  error: null,
};

const useBulletinCategoryTableStore: UseBoundStore<StoreApi<BulletinCategoryTableStore>> =
  create<BulletinCategoryTableStore>((set, get) => ({
    ...initialValues,
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsDialogOpen: (isOpen) => set({ isDialogOpen: isOpen }),
    setIsDeleteDialogOpen: (isOpen) => set({ isDeleteDialogOpen: isOpen }),

    setCategoryPosition: async (categoryId, position) => {
      set({ error: null, isCategoryPositionLoading: true });
      try {
        await eduApi.post<BulletinCategoryResponseDto[]>(BULLETIN_CATEGORY_POSITION_EDU_API_ENDPOINT, {
          categoryId,
          position,
        });
        toast.success(i18n.t('bulletinboard.categoryPositionChanged'));
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isCategoryPositionLoading: false });
      }
    },

    addNewCategory: async (category) => {
      set({ error: null, isLoading: true });
      try {
        await eduApi.post<BulletinCategoryResponseDto[]>(BULLETIN_CATEGORY_EDU_API_ENDPOINT, category);
        toast.success(i18n.t('bulletinboard.categoryCreatedSuccessfully'));
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isLoading: false });
      }
    },

    setSelectedCategory: (category) => set({ selectedCategory: category }),

    fetchTableContent: async () => {
      if (get().isLoading) {
        return;
      }

      set({ error: null, isLoading: true });
      try {
        const response = await eduApi.get<BulletinCategoryResponseDto[]>(
          `${BULLETIN_CATEGORY_WITH_PERMISSION_EDU_API_ENDPOINT}${BulletinCategoryPermission.EDIT}`,
        );
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
        const response = await eduApi.get<{ exists: boolean }>(`${BULLETIN_CATEGORY_EDU_API_ENDPOINT}/${name}`);
        set({ nameExistsAlready: response.data.exists });
      } catch (error) {
        set({ nameExistsAlready: true });
      } finally {
        set({ isNameCheckingLoading: false });
      }
    },

    updateCategory: async (id, category) => {
      set({ error: null, isLoading: true });
      try {
        await eduApi.patch(`${BULLETIN_CATEGORY_EDU_API_ENDPOINT}/${id}`, category);
        toast.success(i18n.t('bulletinboard.categoryUpdatedSuccessfully'));
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isLoading: false });
      }
    },

    deleteCategory: async (id) => {
      set({ error: null, isDeleteDialogLoading: true });
      try {
        await eduApi.delete(`${BULLETIN_BOARD_EDU_API_ENDPOINT}/${id}`);
        await eduApi.delete(`${BULLETIN_CATEGORY_EDU_API_ENDPOINT}/${id}`);
        toast.success(i18n.t('bulletinboard.categoryDeletedSuccessfully'));
        set({ selectedCategory: null });
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isDeleteDialogLoading: false });
      }
    },

    reset: () => set(initialValues),
  }));

export default useBulletinCategoryTableStore;
