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
import { toast } from 'sonner';
import { t } from 'i18next';
import CreateEditPublicFileShareDto from '@libs/filesharing/types/createEditPublicFileShareDto';
import PublicShareResponseDto from '@libs/filesharing/types/publicShareResponseDto';

interface PublicShareFilesStore {
  shares: PublicShareDto[];
  share: PublicShareDto | null;
  selectedContentToShareRows: PublicShareDto[];
  contentsToShare: PublicShareDto[];
  isPublicShareDeleteDialogOpen: boolean;
  isPublicShareQrCodeDialogOpen: boolean;
  isPublicShareEditDialogOpen: boolean;
  isCreateNewPublicShareLinkDialogOpen: boolean;
  isPasswordRequired: boolean;
  contentToShare: PublicShareDto;
  setContentToShare: (file: PublicShareDto) => void;
  setContentsToShare: (files: PublicShareDto[]) => void;
  setShares: (files: PublicShareDto[]) => void;
  setIsPublicShareDeleteDialogOpen: (open: boolean) => void;
  setIsPublicShareEditDialogOpen: (open: boolean) => void;
  setIsPublicShareQrCodeDialogOpen: (open: boolean) => void;
  setIsCreateNewPublicShareLinkDialogOpen: (isOpen: boolean) => void;
  setShare: (file: PublicShareDto | null) => void;
  selectedRows: RowSelectionState;
  setSelectedRows: (sel: RowSelectionState) => void;
  isLoading: boolean;
  isAccessRestricted: boolean;
  isFileAvailable: boolean;
  error: Error | null;
  fetchPublicShareContentById: (id: string) => Promise<PublicShareDto | undefined>;
  fetchPublicShares: () => Promise<void>;
  deletePublicShares: (files: PublicShareDto[]) => Promise<void>;
  updatePublicShare: (files: PublicShareDto) => Promise<void>;
  createPublicShare: (file: CreateEditPublicFileShareDto) => Promise<void>;
  setSelectedPublicShareRows: (files: PublicShareDto[]) => void;
  reset: () => void;
}

const initialState = {
  shares: [],
  contentsToShare: [],
  isCreateNewPublicShareLinkDialogOpen: false,
  share: null,
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
  contentToShare: {} as PublicShareDto,
};

const usePublicShareStore = create<PublicShareFilesStore>((set, get) => ({
  ...initialState,

  fetchPublicShares: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await eduApi.get<PublicShareDto[]>(FILESHARING_SHARED_FILES_API_ENDPOINT);
      set({ shares: data });
    } catch (err) {
      handleApiError(err, set);
      set({ shares: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPublicShareContentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<PublicShareResponseDto>(`${FILESHARING_SHARED_FILES_API_ENDPOINT}/${id}`);

      set({
        share: data.publicShare,
        isPasswordRequired: data.requiresPassword,
        isAccessRestricted: false,
        isLoading: false,
      });

      switch (data.status) {
        case 404:
          set({ isFileAvailable: false, share: null });
          break;
        case 401:
        case 403:
          set({ isAccessRestricted: true, share: null });
          break;
        default:
          set({ isLoading: false });
          break;
      }
      return data.publicShare || undefined;
    } catch (err) {
      handleApiError(err, set);
      set({ isLoading: false, isAccessRestricted: false, share: null });
      return undefined;
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
        shares: state.shares.filter((file) => !removedIds.has(file.publicShareId)),
        contentsToShare: state.contentsToShare.filter((file) => !removedIds.has(file.publicShareId)),
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
      const response = await eduApi.post(FILESHARING_SHARED_FILES_API_ENDPOINT, publicFile);
      const data = response.data as PublicShareResponseDto;
      const publicShare = data.publicShare?.publicShareId || '';
      await get().fetchPublicShareContentById(publicShare);
      set({ selectedContentToShareRows: [], isLoading: true });
      set({ contentsToShare: [...get().contentsToShare] });

      toast.success(t('filesharing.publicFileSharing.success.PublicFileLinkCreated'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      await get().fetchPublicShares();
      set({ isLoading: false });
    }
  },

  setContentToShare: (file) => set({ contentToShare: file }),

  setShare: (file) => set({ share: file }),

  setSelectedPublicShareRows: (files) => set({ selectedContentToShareRows: files }),
  setSelectedRows: (rows) => set({ selectedRows: rows }),

  setIsPublicShareDeleteDialogOpen: (open) => set({ isPublicShareDeleteDialogOpen: open }),
  setIsPublicShareEditDialogOpen: (open) => set({ isPublicShareEditDialogOpen: open }),
  setIsPublicShareQrCodeDialogOpen: (open) => set({ isPublicShareQrCodeDialogOpen: open }),
  setIsCreateNewPublicShareLinkDialogOpen: (isOpen) => set({ isCreateNewPublicShareLinkDialogOpen: isOpen }),

  setShares: (files: PublicShareDto[]) => set({ shares: files }),

  setContentsToShare: (files: PublicShareDto[]) => set({ contentsToShare: files }),
  reset: () => set(initialState),
}));

export default usePublicShareStore;
