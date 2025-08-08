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
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import eduApi from '@/api/eduApi';
import buildApiFileTypePathUrl from '@libs/filesharing/utils/buildApiFileTypePathUrl';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import ContentType from '@libs/filesharing/types/contentType';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import handleApiError from '@/utils/handleApiError';
import { RowSelectionState } from '@tanstack/react-table';
import { LmnApiCollectOperationsType } from '@libs/lmnApi/types/lmnApiCollectOperationsType';
import LMN_API_COLLECT_OPERATIONS from '@libs/lmnApi/constants/lmnApiCollectOperations';
import processWebdavResponse from '@libs/filesharing/utils/processWebdavResponse';
import useFileSharingStore from './useFileSharingStore';

interface UseFileSharingMoveDialogStore {
  activeCollectionOperation: LmnApiCollectOperationsType;
  isLoading: boolean;
  selectedItems: DirectoryFileDTO[];
  dialogShownFiles: DirectoryFileDTO[];
  dialogShownDirs: DirectoryFileDTO[];
  selectedRows: RowSelectionState;
  setSelectedRows: (rows: RowSelectionState) => void;
  fetchDialogFiles: (path?: string) => Promise<void>;
  fetchDialogDirs: (path: string) => Promise<void>;
  setDialogShownFiles: (files: DirectoryFileDTO[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSelectedItems: (items: DirectoryFileDTO[]) => void;
  setActiveCollectionOperation: (collectionType: LmnApiCollectOperationsType) => void;
  reset: () => void;
}

const initialState = {
  dialogShownFiles: [] as DirectoryFileDTO[],
  dialogShownDirs: [] as DirectoryFileDTO[],
  selectedItems: [] as DirectoryFileDTO[],
  isLoading: false,
  selectedRows: {} as RowSelectionState,
  activeCollectionOperation: LMN_API_COLLECT_OPERATIONS.COPY,
};

const useFileSharingMoveDialogStore = create<UseFileSharingMoveDialogStore>((set) => ({
  ...initialState,

  setActiveCollectionOperation: (collectionType: LmnApiCollectOperationsType) =>
    set({ activeCollectionOperation: collectionType }),

  fetchDialogFiles: async (path: string = '/') => {
    try {
      set({ isLoading: true });
      const { data } = await eduApi.get<DirectoryFileDTO[]>(
        buildApiFileTypePathUrl(FileSharingApiEndpoints.BASE, ContentType.FILE, getPathWithoutWebdav(path)),
      );
      const webdavShareType = useFileSharingStore.getState().webdavShares[0]?.type;
      const dialogShownFiles = processWebdavResponse(data, webdavShareType);

      set({
        dialogShownFiles,
        selectedItems: [],
        selectedRows: {},
      });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDialogDirs: async (path: string) => {
    try {
      set({ isLoading: true });
      const { data } = await eduApi.get<DirectoryFileDTO[]>(
        buildApiFileTypePathUrl(FileSharingApiEndpoints.BASE, ContentType.DIRECTORY, getPathWithoutWebdav(path)),
      );

      const webdavShareType = useFileSharingStore.getState().webdavShares[0]?.type;
      const dialogShownDirs = processWebdavResponse(data, webdavShareType);

      set({ dialogShownDirs });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedItems: (items: DirectoryFileDTO[]) => set({ selectedItems: items }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setDialogShownFiles: (files: DirectoryFileDTO[]) => set({ dialogShownFiles: files }),
  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
  reset: () => set(initialState),
}));

export default useFileSharingMoveDialogStore;
