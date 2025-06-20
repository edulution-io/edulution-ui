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

import { RowSelectionState } from '@tanstack/react-table';
import { create } from 'zustand';
import PublicFileShareDto from '@libs/filesharing/types/publicFileShareDto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { FILESHARING_SHARED_FILES_API_ENDPOINT } from '@libs/filesharing/constants/apiEndpoints';
import ApiResponseDto from '@libs/common/types/apiResponseDto';
import { toast } from 'sonner';
import { t } from 'i18next';
import CreateEditPublicFileShareDto from '@libs/filesharing/types/createEditPublicFileShareDto';

interface PublicShareFilesStore {
  publicShareContents: PublicFileShareDto[];
  publicShareContent: PublicFileShareDto | null;
  selectedContentToShareRows: PublicFileShareDto[];
  editMultipleContent: PublicFileShareDto[];
  isPublicShareDeleteDialogOpen: boolean;
  isPublicShareQrCodeDialogOpen: boolean;
  isPublicShareEditDialogOpen: boolean;
  isCreateNewPublicShareLinkDialogOpen: boolean;
  isPasswordRequired: boolean;

  setEditMultipleContent: (files: PublicFileShareDto[]) => void;
  setPublicShareContents: (files: PublicFileShareDto[]) => void;
  setIsPublicShareDeleteDialogOpen: (open: boolean) => void;
  setIsPublicShareEditDialogOpen: (open: boolean) => void;
  setIsPublicShareQrCodeDialogOpen: (open: boolean) => void;
  setIsCreateNewPublicShareLinkDialogOpen: (isOpen: boolean) => void;
  setPublicShareContent: (file: PublicFileShareDto | null) => void;
  selectedRows: RowSelectionState;
  setSelectedRows: (sel: RowSelectionState) => void;
  isLoading: boolean;
  isAccessRestricted: boolean;
  isFileAvailable: boolean;
  error: Error | null;
  fetchPublicShareContentById: (id: string, token: string) => Promise<void>;
  fetchPublicShares: () => Promise<void>;
  deletePublicShares: (files: PublicFileShareDto[]) => Promise<void>;
  updatePublicShare: (files: PublicFileShareDto) => Promise<void>;
  createPublicShare: (file: CreateEditPublicFileShareDto) => Promise<void>;
  setSelectedPublicShareRows: (files: PublicFileShareDto[]) => void;
  reset: () => void;
}

const initialState = {
  publicShareContents: [],
  editMultipleContent: [],
  isCreateNewPublicShareLinkDialogOpen: false,
  publicShareContent: null,
  selectedContentToShareRows: [],
  selectedRows: {},
  isLoading: false,
  isAccessRestricted: false,
  isFileAvailable: false,
  error: null,
  isPublicShareDeleteDialogOpen: false,
  isPublicShareEditDialogOpen: false,
  isPublicShareQrCodeDialogOpen: false,
  isPasswordRequired: false,
};

export const usePublicShareStore = create<PublicShareFilesStore>((set, get) => ({
  ...initialState,

  fetchPublicShares: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await eduApi.get<PublicFileShareDto[]>(FILESHARING_SHARED_FILES_API_ENDPOINT);
      set({ publicShareContents: data });
    } catch (err) {
      handleApiError(err, set);
      set({ publicShareContents: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPublicShareContentById: async (id: string, eduApiToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<ApiResponseDto<PublicFileShareDto>>(
        `${FILESHARING_SHARED_FILES_API_ENDPOINT}/${id}`,
        {
          headers: { Authorization: `Bearer ${eduApiToken}` },
        },
      );

      set({
        publicShareContent: data.data,
        isPasswordRequired: data.requiresPassword,
        isAccessRestricted: false,
        isLoading: false,
      });

      switch (data.status) {
        case 404:
          set({ isFileAvailable: false, publicShareContent: null });
          break;
        case 401:
        case 403:
          set({ isAccessRestricted: true, publicShareContent: null });
          break;
        default:
          set({ isLoading: false });
          break;
      }
    } catch (err) {
      handleApiError(err, set);
      set({ isLoading: false, isAccessRestricted: false, publicShareContent: null });
    }
  },

  deletePublicShares: async (filesToDelete: PublicFileShareDto[]) => {
    set({ isLoading: true, error: null });

    try {
      await eduApi.delete(FILESHARING_SHARED_FILES_API_ENDPOINT, {
        data: filesToDelete,
      });

      const removedIds = new Set(filesToDelete.map((file) => file._id));

      set((state) => ({
        ...state,
        publicShareContents: state.publicShareContents.filter((file) => !removedIds.has(file._id)),
        editMultipleContent: state.editMultipleContent.filter((file) => !removedIds.has(file._id)),
        selectedContentToShareRows: [],
        selectedRows: {},
      }));

      toast.success(t('filesharing.publicFileSharing.success.PublicFileLinkDeleted'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      void get().fetchPublicShares();
      set({ isLoading: false, selectedRows: {} });
    }
  },

  updatePublicShare: async (publicFiles: PublicFileShareDto) => {
    set({ isLoading: true, error: null });

    try {
      await eduApi.patch(FILESHARING_SHARED_FILES_API_ENDPOINT, publicFiles);

      set({ selectedContentToShareRows: [], isLoading: true });
      toast.success(t('filesharing.publicFileSharing.success.PublicFileLinkUpdated'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      void get().fetchPublicShares();
      set({ isLoading: false, selectedRows: {} });
    }
  },

  createPublicShare: async (publicFile: CreateEditPublicFileShareDto) => {
    set({ isLoading: true, error: null });

    try {
      await eduApi.post(FILESHARING_SHARED_FILES_API_ENDPOINT, publicFile);
      set({ selectedContentToShareRows: [], isLoading: true });
      toast.success(t('filesharing.publicFileSharing.success.PublicFileLinkCreated'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      void get().fetchPublicShares();
      set({ isLoading: false, selectedRows: {} });
    }
  },

  setPublicShareContent: (file) => set({ publicShareContent: file }),

  setSelectedPublicShareRows: (files) => set({ selectedContentToShareRows: files }),
  setSelectedRows: (rows) => set({ selectedRows: rows }),

  setIsPublicShareDeleteDialogOpen: (open) => set({ isPublicShareDeleteDialogOpen: open }),
  setIsPublicShareEditDialogOpen: (open) => set({ isPublicShareEditDialogOpen: open }),
  setIsPublicShareQrCodeDialogOpen: (open) => set({ isPublicShareQrCodeDialogOpen: open }),
  setIsCreateNewPublicShareLinkDialogOpen: (isOpen) => set({ isCreateNewPublicShareLinkDialogOpen: isOpen }),

  setPublicShareContents: (files: PublicFileShareDto[]) => set({ publicShareContents: files }),

  setEditMultipleContent: (files: PublicFileShareDto[]) => set({ editMultipleContent: files }),
  reset: () => set(initialState),
}));

export default usePublicShareStore;
