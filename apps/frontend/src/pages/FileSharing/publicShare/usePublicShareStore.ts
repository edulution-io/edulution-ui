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

import { create } from 'zustand';
import { toast } from 'sonner';
import { t } from 'i18next';

import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import FILESHARING_SHARED_FILES_API_ENDPOINT from '@libs/filesharing/constants/apiEndpoints';
import type PublicShareDto from '@libs/filesharing/types/publicShareDto';
import type CreateOrEditPublicShareDto from '@libs/filesharing/types/createOrEditPublicShareDto';
import type PublicShareResponseDto from '@libs/filesharing/types/publicShareResponseDto';
import { RowSelectionState } from '@tanstack/react-table';
import axios from 'axios';
import { PublicShareDialogNameType } from '@libs/filesharing/types/publicShareDialogNameType';
import PUBLIC_SHARE_DIALOG_NAMES from '@libs/filesharing/constants/publicShareDialogNames';

interface PublicShareStoreState {
  shares: PublicShareDto[] | [];
  share: PublicShareDto;
  fetchedShareByIdResult: PublicShareResponseDto;
  selectedShares: PublicShareDto[];
  dialog: Record<PublicShareDialogNameType, boolean>;
  isLoading: boolean;
  error: Error | null;
  selectedRows: RowSelectionState;
  fetchShares: () => Promise<void>;
  fetchShareById: (id: string) => Promise<PublicShareDto | undefined>;
  createShare: (dto: CreateOrEditPublicShareDto) => Promise<void>;
  updateShare: (dto: CreateOrEditPublicShareDto) => Promise<void>;
  deleteShares: (shares: PublicShareDto[]) => Promise<void>;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  setFetchedShareByIdResult: (result: PublicShareResponseDto) => void;
  setShare: (share: PublicShareDto) => void;
  setSelectedShares: (shares: PublicShareDto[]) => void;
  openDialog: (name: PublicShareDialogNameType, publicShare?: PublicShareDto) => void;
  closeDialog: (name: PublicShareDialogNameType) => void;

  downloadFileWithPassword: (
    url: string,
    filename: string,
    password: string | undefined,
    onWrongPassword?: () => void,
    authToken?: string,
  ) => Promise<void>;

  reset: () => void;
}

const initialState = {
  shares: [],
  share: {} as PublicShareDto,
  selectedShares: [],
  selectedRows: {},
  fetchedShareByIdResult: {} as PublicShareResponseDto,
  dialog: {
    delete: false,
    edit: false,
    qrCode: false,
    createLink: false,
  },
  isLoading: false,
  error: null,
};

const usePublicShareStore = create<PublicShareStoreState>((set, get) => ({
  ...initialState,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setShare: (share: PublicShareDto) => set({ share }),

  async fetchShares() {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<PublicShareResponseDto>(FILESHARING_SHARED_FILES_API_ENDPOINT);
      let fetchedShares: PublicShareDto[] = [];
      if (data.publicShare) {
        fetchedShares = Array.isArray(data.publicShare) ? data.publicShare : [data.publicShare];
      }

      set({ shares: fetchedShares });
    } catch (err) {
      handleApiError(err, set);
      set({ shares: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  async fetchShareById(id) {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<PublicShareResponseDto>(`${FILESHARING_SHARED_FILES_API_ENDPOINT}/${id}`);
      const share = Array.isArray(data.publicShare) ? data.publicShare[0] : data.publicShare;
      set({ fetchedShareByIdResult: data ?? null });
      return share ?? undefined;
    } catch (err) {
      handleApiError(err, set);
      return undefined;
    } finally {
      set({ isLoading: false });
    }
  },

  async createShare(dto) {
    set({ isLoading: true, error: null });
    try {
      await eduApi.post(FILESHARING_SHARED_FILES_API_ENDPOINT, dto);
      toast.success(t('filesharing.publicFileSharing.success.PublicFileLinkCreated'));
      await get().fetchShares();
    } catch (err) {
      handleApiError(err, set);
    } finally {
      set({ share: {} as PublicShareDto });
      set({ isLoading: false });
    }
  },

  async updateShare(dto) {
    set({ isLoading: true, error: null });
    try {
      await eduApi.patch(FILESHARING_SHARED_FILES_API_ENDPOINT, dto);
      toast.success(t('filesharing.publicFileSharing.success.PublicFileLinkUpdated'));
      await get().fetchShares();
    } catch (err) {
      handleApiError(err, set);
    } finally {
      set({ share: {} as PublicShareDto });
      set({ isLoading: false });
    }
  },

  async deleteShares(sharesToDelete) {
    set({ isLoading: true, error: null });
    try {
      await eduApi.delete(FILESHARING_SHARED_FILES_API_ENDPOINT, { data: sharesToDelete });
      toast.success(t('filesharing.publicFileSharing.success.PublicFileLinkDeleted'));
      await get().fetchShares();
      const remainingIds = new Set(get().shares.map((share) => share.publicShareId));
      set({ selectedShares: get().selectedShares.filter((s) => remainingIds.has(s.publicShareId)) });
    } catch (err) {
      handleApiError(err, set);
    } finally {
      set({ isLoading: false });
    }
  },

  async downloadFileWithPassword(url, filename, password, onWrongPassword, authToken) {
    try {
      const res = await axios.post(
        url,
        { password },
        {
          responseType: 'blob',
          validateStatus: (s) => s < 300 || s === 401 || s === 403,
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        },
      );

      if (res.status === 401 || res.status === 403) {
        onWrongPassword?.();
        return;
      }

      const blobUrl = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      handleApiError(err, set);
    }
  },

  setSelectedShares(selected) {
    set({ selectedShares: selected });
  },

  openDialog(name, share?) {
    set((state) => {
      const next: Partial<PublicShareStoreState> = {};
      if (name === PUBLIC_SHARE_DIALOG_NAMES.EDIT && share) next.share = share;
      if (state.dialog[name]) return next;
      return { ...next, dialog: { ...state.dialog, [name]: true } };
    });
  },

  closeDialog(name) {
    set((state) => {
      if (!state.dialog[name]) return state;
      return { dialog: { ...state.dialog, [name]: false } };
    });
  },

  setSelectedRows: (selectedRows: RowSelectionState) => {
    set({ selectedRows });
  },

  setFetchedShareByIdResult: (result: PublicShareResponseDto) => {
    set({ fetchedShareByIdResult: result });
  },

  reset() {
    set(initialState);
  },
}));

export default usePublicShareStore;
