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
import { RowSelectionState } from '@tanstack/react-table';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import {
  BULLETIN_BOARD_BULLETINS_EDU_API_ENDPOINT,
  BULLETIN_BOARD_EDU_API_ENDPOINT,
  BULLETIN_BOARD_UPLOAD_EDU_API_ENDPOINT,
  BULLETIN_CATEGORY_WITH_PERMISSION_EDU_API_ENDPOINT,
} from '@libs/bulletinBoard/constants/apiEndpoints';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import BulletinCategoryPermission from '@libs/appconfig/constants/bulletinCategoryPermission';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import { toast } from 'sonner';
import i18n from '@/i18n';

interface BulletinBoardEditorialStore {
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  bulletins: BulletinResponseDto[];
  selectedBulletinToEdit: BulletinResponseDto | null;
  setSelectedBulletinToEdit: (bulletin: BulletinResponseDto | null) => void;
  updateBulletin: (id: string, bulletin: Partial<CreateBulletinDto>) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
  getBulletins: (isLoading?: boolean) => Promise<void>;
  deleteBulletins: (bulletins: BulletinResponseDto[]) => Promise<void>;
  isDeleteBulletinDialogOpen: boolean;
  setIsDeleteBulletinDialogOpen: (isOpen: boolean) => void;
  createBulletin: (bulletin: CreateBulletinDto) => Promise<boolean>;
  isCreateBulletinDialogOpen: boolean;
  setIsCreateBulletinDialogOpen: (isOpen: boolean) => void;
  isDialogLoading: boolean;
  uploadAttachment: (attachment: File) => Promise<string>;
  isAttachmentUploadLoading: boolean;
  categoriesWithEditPermission: BulletinCategoryResponseDto[];
  getCategoriesWithEditPermission: () => Promise<void>;
  isGetCategoriesLoading: boolean;
  reset: () => void;
}

const initialValues = {
  bulletins: [],
  categoriesWithEditPermission: [],
  selectedBulletinToEdit: null,
  isLoading: false,
  error: null,
  selectedRows: {},
  isDeleteBulletinDialogOpen: false,
  isCreateBulletinDialogOpen: false,
  isDialogLoading: false,
  isAttachmentUploadLoading: false,
  isGetCategoriesLoading: false,
};

const useBulletinBoardEditorialStore = create<BulletinBoardEditorialStore>((set, get) => ({
  ...initialValues,

  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),

  setSelectedBulletinToEdit: (selectedBulletinToEdit) => set({ selectedBulletinToEdit }),

  getBulletins: async (isLoading = true) => {
    if (get().isLoading) return;

    set({ isLoading, error: null });
    try {
      const { data } = await eduApi.get<BulletinResponseDto[]>(BULLETIN_BOARD_BULLETINS_EDU_API_ENDPOINT);
      set({ bulletins: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  setIsDeleteBulletinDialogOpen: (isOpen) => set({ isDeleteBulletinDialogOpen: isOpen }),
  deleteBulletins: async (bulletins: BulletinResponseDto[]) => {
    set({ isDialogLoading: true, error: null });
    try {
      await eduApi.delete<BulletinResponseDto[]>(BULLETIN_BOARD_EDU_API_ENDPOINT, {
        data: bulletins.map((c) => c.id),
      });

      set({
        bulletins: get().bulletins.filter((item) => !bulletins.some((b) => b.id === item.id)),
        selectedRows: {},
      });
      toast.success(i18n.t('bulletinboard.bulletinsDeletedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isDialogLoading: false });
    }
  },

  setIsCreateBulletinDialogOpen: (isOpen) => set({ isCreateBulletinDialogOpen: isOpen }),
  createBulletin: async (bulletin) => {
    set({ isDialogLoading: true, error: null });
    try {
      const { data } = await eduApi.post<BulletinResponseDto>(BULLETIN_BOARD_EDU_API_ENDPOINT, bulletin);

      set({ bulletins: [...get().bulletins, data], selectedRows: {} });
      toast.success(i18n.t('bulletinboard.bulletinCreatedSuccessfully'));
      return true;
    } catch (error) {
      handleApiError(error, set);
      return false;
    } finally {
      set({ isDialogLoading: false });
    }
  },

  updateBulletin: async (id, bulletin) => {
    set({ isDialogLoading: true, error: null });
    try {
      const { data } = await eduApi.patch<BulletinResponseDto>(`${BULLETIN_BOARD_EDU_API_ENDPOINT}/${id}`, bulletin);

      set({ bulletins: [...get().bulletins.filter((item) => item.id !== id), data], selectedRows: {} });
      toast.success(i18n.t('bulletinboard.bulletinUpdatedSuccessfully'));
      return true;
    } catch (error) {
      handleApiError(error, set);
      return false;
    } finally {
      set({ isDialogLoading: false });
    }
  },

  uploadAttachment: async (file): Promise<string> => {
    set({ isAttachmentUploadLoading: true, error: null });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await eduApi.post<string>(BULLETIN_BOARD_UPLOAD_EDU_API_ENDPOINT, formData, {
        headers: { [HTTP_HEADERS.ContentType]: RequestResponseContentType.MULTIPART_FORM_DATA },
      });

      return response.data;
    } catch (error) {
      handleApiError(error, set);
      return '';
    } finally {
      set({ isAttachmentUploadLoading: false });
    }
  },

  getCategoriesWithEditPermission: async () => {
    if (get().isGetCategoriesLoading) return;

    set({ error: null, isGetCategoriesLoading: true });
    try {
      const response = await eduApi.get<BulletinCategoryResponseDto[]>(
        `${BULLETIN_CATEGORY_WITH_PERMISSION_EDU_API_ENDPOINT}${BulletinCategoryPermission.EDIT}`,
      );
      set({ categoriesWithEditPermission: response.data?.sort((a, b) => a.position - b.position) });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isGetCategoriesLoading: false });
    }
  },

  reset: () => set(initialValues),
}));

export default useBulletinBoardEditorialStore;
