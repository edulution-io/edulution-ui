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
  publicShareFiles: PublicFileShareDto[];
  publicShareFile: PublicFileShareDto | null;
  selectedFilesToShareRows: PublicFileShareDto[];
  editMultipleFiles: PublicFileShareDto[];
  isShareFileDeleteDialogOpen: boolean;
  isShareFileQrCodeDialogOpen: boolean;
  isShareFileEditDialogOpen: boolean;
  isCreateNewFileLinkDialogOpen: boolean;
  isPasswordRequired: boolean;

  setEditMultipleFiles: (files: PublicFileShareDto[]) => void;
  setPublicShareFiles: (files: PublicFileShareDto[]) => void;
  setIsShareFileDeleteDialogOpen: (open: boolean) => void;
  setIsShareFileEditDialogOpen: (open: boolean) => void;
  setIsShareFileQrCodeDialogOpen: (open: boolean) => void;
  setIsCreateNewFileLinkDialogOpen: (isOpen: boolean) => void;
  setPublicShareFile: (file: PublicFileShareDto | null) => void;
  selectedRows: RowSelectionState;
  setSelectedRows: (sel: RowSelectionState) => void;
  isLoading: boolean;
  isAccessRestricted: boolean;
  isFileAvailable: boolean;
  error: Error | null;
  fetchPublicShareFilesById: (id: string, token: string) => Promise<void>;
  fetchPublicShareFiles: () => Promise<void>;
  deletePublicShareFiles: (files: PublicFileShareDto[]) => Promise<void>;
  updatePublicShareFile: (files: PublicFileShareDto) => Promise<void>;
  createPublicShareFile: (file: CreateEditPublicFileShareDto) => Promise<void>;
  setSelectedFilesToShareRows: (files: PublicFileShareDto[]) => void;
  reset: () => void;
}

const initialState = {
  publicShareFiles: [],
  editMultipleFiles: [],
  openShareFileDialog: false,
  isCreateNewFileLinkDialogOpen: false,
  publicShareFile: null,
  selectedFilesToShareRows: [],
  selectedRows: {},
  isLoading: false,
  isAccessRestricted: false,
  isFileAvailable: false,
  error: null,
  isShareFileDeleteDialogOpen: false,
  isShareFileEditDialogOpen: false,
  isShareFileQrCodeDialogOpen: false,
  isPasswordRequired: false,
};

export const usePublicShareFilesStore = create<PublicShareFilesStore>((set, get) => ({
  ...initialState,

  fetchPublicShareFiles: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await eduApi.get<PublicFileShareDto[]>(FILESHARING_SHARED_FILES_API_ENDPOINT);
      set({ publicShareFiles: data });
    } catch (err) {
      handleApiError(err, set);
      set({ publicShareFiles: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPublicShareFilesById: async (id: string, eduApiToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<ApiResponseDto<PublicFileShareDto>>(
        `${FILESHARING_SHARED_FILES_API_ENDPOINT}/${id}`,
        {
          headers: { Authorization: `Bearer ${eduApiToken}` },
        },
      );

      set({
        publicShareFile: data.data,
        isPasswordRequired: data.requiresPassword,
        isAccessRestricted: false,
        isLoading: false,
      });

      switch (data.status) {
        case 404:
          set({ isFileAvailable: false, publicShareFile: null });
          break;
        case 401:
        case 403:
          set({ isAccessRestricted: true, publicShareFile: null });
          break;
        default:
          set({ isLoading: false });
          break;
      }
    } catch (err) {
      handleApiError(err, set);
      set({ isLoading: false, isAccessRestricted: false, publicShareFile: null });
    }
  },

  deletePublicShareFiles: async (filesToDelete: PublicFileShareDto[]) => {
    set({ isLoading: true, error: null });

    try {
      await eduApi.delete(FILESHARING_SHARED_FILES_API_ENDPOINT, {
        data: filesToDelete,
      });

      const removedIds = new Set(filesToDelete.map((file) => file._id));

      set((state) => ({
        ...state,
        publicShareFiles: state.publicShareFiles.filter((file) => !removedIds.has(file._id)),
        editMultipleFiles: state.editMultipleFiles.filter((file) => !removedIds.has(file._id)),
        selectedFilesToShareRows: [],
        selectedRows: {},
      }));

      toast.success(t('filesharing.publicFileSharing.success.PublicFileLinkDeleted'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      void get().fetchPublicShareFiles();
      set({ isLoading: false, selectedRows: {} });
    }
  },

  updatePublicShareFile: async (publicFiles: PublicFileShareDto) => {
    set({ isLoading: true, error: null });

    try {
      await eduApi.patch(FILESHARING_SHARED_FILES_API_ENDPOINT, publicFiles);

      set({ selectedFilesToShareRows: [], isLoading: true });
      toast.success(t('filesharing.publicFileSharing.success.PublicFileLinkUpdated'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      void get().fetchPublicShareFiles();
      set({ isLoading: false, selectedRows: {} });
    }
  },

  createPublicShareFile: async (publicFile: CreateEditPublicFileShareDto) => {
    set({ isLoading: true, error: null });

    try {
      await eduApi.post(FILESHARING_SHARED_FILES_API_ENDPOINT, publicFile);
      set({ selectedFilesToShareRows: [], isLoading: true });
      toast.success(t('filesharing.publicFileSharing.success.PublicFileLinkCreated'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      void get().fetchPublicShareFiles();
      set({ isLoading: false, selectedRows: {} });
    }
  },

  setPublicShareFile: (file) => set({ publicShareFile: file }),

  setSelectedFilesToShareRows: (files) => set({ selectedFilesToShareRows: files }),
  setSelectedRows: (rows) => set({ selectedRows: rows }),

  setIsShareFileDeleteDialogOpen: (open) => set({ isShareFileDeleteDialogOpen: open }),
  setIsShareFileEditDialogOpen: (open) => set({ isShareFileEditDialogOpen: open }),
  setIsShareFileQrCodeDialogOpen: (open) => set({ isShareFileQrCodeDialogOpen: open }),
  setIsCreateNewFileLinkDialogOpen: (isOpen) => set({ isCreateNewFileLinkDialogOpen: isOpen }),

  setPublicShareFiles: (files: PublicFileShareDto[]) => set({ publicShareFiles: files }),

  setEditMultipleFiles: (files: PublicFileShareDto[]) => set({ editMultipleFiles: files }),
  reset: () => set(initialState),
}));

export default usePublicShareFilesStore;
