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
import PublicShareDto from '@libs/filesharing/types/publicShareDto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { FILESHARING_SHARED_FILES_API_ENDPOINT } from '@libs/filesharing/constants/apiEndpoints';
import ApiResponseDto from '@libs/common/types/apiResponseDto';
import { toast } from 'sonner';
import { t } from 'i18next';
import CreateEditPublicFileShareDto from '@libs/filesharing/types/createEditPublicFileShareDto';

interface PublicShareFilesStore {
  publicShareContents: PublicShareDto[];
  publicShareContent: PublicShareDto | null;
  selectedContentToShareRows: PublicShareDto[];
  editMultipleContent: PublicShareDto[];
  isPublicShareDeleteDialogOpen: boolean;
  isPublicShareQrCodeDialogOpen: boolean;
  isPublicShareEditDialogOpen: boolean;
  isCreateNewPublicShareLinkDialogOpen: boolean;
  isPasswordRequired: boolean;
  editContent: PublicShareDto;

  setEditContent: (file: PublicShareDto) => void;
  setEditMultipleContent: (files: PublicShareDto[]) => void;
  setPublicShareContents: (files: PublicShareDto[]) => void;
  setIsPublicShareDeleteDialogOpen: (open: boolean) => void;
  setIsPublicShareEditDialogOpen: (open: boolean) => void;
  setIsPublicShareQrCodeDialogOpen: (open: boolean) => void;
  setIsCreateNewPublicShareLinkDialogOpen: (isOpen: boolean) => void;
  setPublicShareContent: (file: PublicShareDto | null) => void;
  selectedRows: RowSelectionState;
  setSelectedRows: (sel: RowSelectionState) => void;
  isLoading: boolean;
  isAccessRestricted: boolean;
  isFileAvailable: boolean;
  error: Error | null;
  fetchPublicShareContentById: (id: string) => Promise<void>;
  fetchPublicShares: () => Promise<void>;
  deletePublicShares: (files: PublicShareDto[]) => Promise<void>;
  updatePublicShare: (files: PublicShareDto) => Promise<void>;
  createPublicShare: (file: CreateEditPublicFileShareDto) => Promise<void>;
  setSelectedPublicShareRows: (files: PublicShareDto[]) => void;
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
  editContent: {} as PublicShareDto,
};

export const usePublicShareStore = create<PublicShareFilesStore>((set, get) => ({
  ...initialState,

  fetchPublicShares: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await eduApi.get<PublicShareDto[]>(FILESHARING_SHARED_FILES_API_ENDPOINT);
      set({ publicShareContents: data });
    } catch (err) {
      handleApiError(err, set);
      set({ publicShareContents: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPublicShareContentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<ApiResponseDto<PublicShareDto>>(
        `${FILESHARING_SHARED_FILES_API_ENDPOINT}/${id}`,
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

  deletePublicShares: async (filesToDelete: PublicShareDto[]) => {
    set({ isLoading: true, error: null });

    try {
      await eduApi.delete(FILESHARING_SHARED_FILES_API_ENDPOINT, {
        data: filesToDelete,
      });

      const removedIds = new Set(filesToDelete.map((file) => file.publicShareId));

      set((state) => ({
        ...state,
        publicShareContents: state.publicShareContents.filter((file) => !removedIds.has(file.publicShareId)),
        editMultipleContent: state.editMultipleContent.filter((file) => !removedIds.has(file.publicShareId)),
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

  updatePublicShare: async (publicFiles: PublicShareDto) => {
    set({ isLoading: true, error: null });

    try {
      await eduApi.patch(FILESHARING_SHARED_FILES_API_ENDPOINT, publicFiles);

      set({ isLoading: true });
      toast.success(t('filesharing.publicFileSharing.success.PublicFileLinkUpdated'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      void get().fetchPublicShares();
      set({ isLoading: false });
    }
  },

  createPublicShare: async (publicFile: CreateEditPublicFileShareDto) => {
    set({ isLoading: true, error: null });

    try {
      const data = await eduApi.post(FILESHARING_SHARED_FILES_API_ENDPOINT, publicFile);
      const created = data.data as PublicShareDto;
      set({ selectedContentToShareRows: [], isLoading: true });
      set({ editMultipleContent: [...get().editMultipleContent, created] });

      toast.success(t('filesharing.publicFileSharing.success.PublicFileLinkCreated'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      await get().fetchPublicShares();
      set({ isLoading: false });
    }
  },

  setEditContent: (file) => set({ editContent: file }),

  setPublicShareContent: (file) => set({ publicShareContent: file }),

  setSelectedPublicShareRows: (files) => set({ selectedContentToShareRows: files }),
  setSelectedRows: (rows) => set({ selectedRows: rows }),

  setIsPublicShareDeleteDialogOpen: (open) => set({ isPublicShareDeleteDialogOpen: open }),
  setIsPublicShareEditDialogOpen: (open) => set({ isPublicShareEditDialogOpen: open }),
  setIsPublicShareQrCodeDialogOpen: (open) => set({ isPublicShareQrCodeDialogOpen: open }),
  setIsCreateNewPublicShareLinkDialogOpen: (isOpen) => set({ isCreateNewPublicShareLinkDialogOpen: isOpen }),

  setPublicShareContents: (files: PublicShareDto[]) => set({ publicShareContents: files }),

  setEditMultipleContent: (files: PublicShareDto[]) => set({ editMultipleContent: files }),
  reset: () => set(initialState),
}));

export default usePublicShareStore;
