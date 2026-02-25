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
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import eduApi from '@/api/eduApi';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import ContentType from '@libs/filesharing/types/contentType';
import handleApiError from '@/utils/handleApiError';
import { RowSelectionState } from '@tanstack/react-table';
import { LmnApiCollectOperationsType } from '@libs/lmnApi/types/lmnApiCollectOperationsType';
import LMN_API_COLLECT_OPERATIONS from '@libs/lmnApi/constants/lmnApiCollectOperations';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import processWebdavResponse from '@libs/filesharing/utils/processWebdavResponse';

interface UseFileSharingMoveDialogStore {
  activeCollectionOperation: LmnApiCollectOperationsType;
  isLoading: boolean;
  selectedItems: DirectoryFileDTO[];
  dialogShownFiles: DirectoryFileDTO[];
  dialogShownDirs: DirectoryFileDTO[];
  selectedRows: RowSelectionState;
  setSelectedRows: (rows: RowSelectionState) => void;
  fetchDialogFiles: (shareName: string | undefined, path?: string, forceCleanupCache?: boolean) => Promise<void>;
  fetchDialogDirs: (shareName: string | undefined, path: string, forceCleanupCache?: boolean) => Promise<void>;
  setDialogShownFiles: (files: DirectoryFileDTO[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSelectedItems: (items: DirectoryFileDTO[]) => void;
  setActiveCollectionOperation: (collectionType: LmnApiCollectOperationsType) => void;
  clearDialogFilesOnShareChange: () => void;
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

  fetchDialogFiles: async (shareName, path: string = '/', forceCleanupCache: boolean = false) => {
    try {
      set({ isLoading: true });
      const headers: Record<string, string> = {};
      if (forceCleanupCache) {
        headers[HTTP_HEADERS.XForceCleanupCache] = 'true';
      }
      const { data } = await eduApi.get<DirectoryFileDTO[]>(FileSharingApiEndpoints.BASE, {
        params: { type: ContentType.FILE, path, share: shareName },
        headers,
      });
      const dialogShownFiles = processWebdavResponse(data, path);

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

  fetchDialogDirs: async (shareName, path: string, forceCleanupCache: boolean = false) => {
    try {
      set({ isLoading: true });
      const headers: Record<string, string> = {};
      if (forceCleanupCache) {
        headers[HTTP_HEADERS.XForceCleanupCache] = 'true';
      }
      const { data } = await eduApi.get<DirectoryFileDTO[]>(FileSharingApiEndpoints.BASE, {
        params: { type: ContentType.DIRECTORY, path, share: shareName },
        headers,
      });

      const dialogShownDirs = processWebdavResponse(data, path);

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
  clearDialogFilesOnShareChange: () => {
    set({
      dialogShownFiles: [],
      dialogShownDirs: [],
      selectedItems: [],
      selectedRows: {},
      isLoading: true,
    });
  },
  reset: () => set(initialState),
}));

export default useFileSharingMoveDialogStore;
