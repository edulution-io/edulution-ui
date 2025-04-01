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
import eduApi from '@libs/common/constants/eduApi';
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
