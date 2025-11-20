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

import { RowSelectionState } from '@tanstack/react-table';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import eduApi from '@/api/eduApi';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import handleApiError from '@/utils/handleApiError';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import ContentType from '@libs/filesharing/types/contentType';
import delay from '@libs/common/utils/delay';
import DownloadFileDto from '@libs/filesharing/types/downloadFileDto';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import processWebdavResponse from '@libs/filesharing/utils/processWebdavResponse';

type UseFileSharingStore = {
  files: DirectoryFileDTO[];
  selectedItems: DirectoryFileDTO[];
  currentPath: string;
  downloadProgressList: DownloadFileDto[];
  pathToRestoreSession: string;
  fileOperationProgress: null | FilesharingProgressDto;
  directories: DirectoryFileDTO[];
  selectedRows: RowSelectionState;
  setSelectedRows: (rows: RowSelectionState) => void;
  setCurrentPath: (path: string) => void;
  setPathToRestoreSession: (path: string) => void;
  setSelectedItems: (items: DirectoryFileDTO[]) => void;
  fetchFiles: (shareName: string | undefined, path?: string) => Promise<void>;
  reset: () => void;
  mountPoints: DirectoryFileDTO[];
  isLoading: boolean;
  isWebdavSharesLoading: boolean;
  isError: boolean;
  currentlyDisabledFiles: Record<string, boolean>;
  setFileIsCurrentlyDisabled: (filename: string, isLocked: boolean, durationMs?: number) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
  setFileOperationProgress: (progress: FilesharingProgressDto | null) => void;
  setDownloadProgressList: (progressList: DownloadFileDto[]) => void;
  updateDownloadProgress: (progress: DownloadFileDto) => void;
  removeDownloadProgress: (fileName: string) => void;
  webdavShares: WebdavShareDto[];
  fetchWebdavShares: () => Promise<WebdavShareDto[]>;
  selectedWebdavShare: string;
  setSelectedWebdavShare: (webdavShare: string) => void;
  forceCleanupCache: boolean;
  setForceCleanupCache: (forceCleanupCache: boolean) => void;
};

const initialState = {
  files: [],
  selectedItems: [],
  currentPath: `/`,
  pathToRestoreSession: `/`,
  selectedRows: {},
  mountPoints: [],
  directories: [],
  isLoading: false,
  isWebdavSharesLoading: false,
  isError: false,
  currentlyDisabledFiles: {},
  downloadProgressList: [],
  fileOperationProgress: null,
  webdavShares: [],
  selectedWebdavShare: '',
  forceCleanupCache: false,
};

type PersistedFileManagerStore = (
  fileManagerData: StateCreator<UseFileSharingStore>,
  options: PersistOptions<Partial<UseFileSharingStore>>,
) => StateCreator<UseFileSharingStore>;

const useFileSharingStore = create<UseFileSharingStore>(
  (persist as PersistedFileManagerStore)(
    (set, get) => ({
      ...initialState,
      setCurrentPath: (path: string) => {
        set({ currentPath: path });
      },

      setFileOperationProgress: (progress: FilesharingProgressDto | null) => set({ fileOperationProgress: progress }),

      setDownloadProgressList: (progressList) => {
        set({ downloadProgressList: progressList });
      },

      removeDownloadProgress: (fileName) => {
        const { downloadProgressList } = get();
        set({
          downloadProgressList: downloadProgressList.filter((d) => d.fileName !== fileName),
        });
      },

      updateDownloadProgress: (progress) => {
        const { downloadProgressList } = get();
        const existingIndex = downloadProgressList.findIndex((d) => d.fileName === progress.fileName);

        if (existingIndex >= 0) {
          const updatedList = [...downloadProgressList];
          updatedList[existingIndex] = progress;

          set({ downloadProgressList: updatedList });
        } else {
          set({ downloadProgressList: [...downloadProgressList, progress] });
        }
      },

      setPathToRestoreSession: (path: string) => {
        set({ pathToRestoreSession: path });
      },

      setIsLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      fetchFiles: async (shareName, path: string = '/') => {
        try {
          set({ isLoading: true });
          const { forceCleanupCache } = get();
          const { data } = await eduApi.get<DirectoryFileDTO[]>(FileSharingApiEndpoints.BASE, {
            params: { type: ContentType.FILE, path, share: shareName, forceCleanupCache },
          });

          const webdavShareType = get().webdavShares.find((s) => s.displayName === shareName)?.type;
          if (!webdavShareType) return;
          const files = processWebdavResponse(data, webdavShareType);

          set({
            currentPath: path,
            files,
            selectedItems: [],
            selectedRows: {},
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      setFileIsCurrentlyDisabled: async (filename, isLocked, durationMs) => {
        set({
          currentlyDisabledFiles: {
            ...get().currentlyDisabledFiles,
            [filename]: isLocked,
          },
        });
        if (durationMs) {
          await delay(durationMs);
          set({
            ...get().currentlyDisabledFiles,
            currentlyDisabledFiles: { [filename]: !isLocked },
          });
        }
      },

      setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
      setSelectedItems: (items: DirectoryFileDTO[]) => set({ selectedItems: items }),

      fetchWebdavShares: async () => {
        if (get().isWebdavSharesLoading) return get().webdavShares;
        try {
          set({ isWebdavSharesLoading: true });

          const { data } = await eduApi.get<WebdavShareDto[]>('/webdav-shares');
          set({
            webdavShares: data,
          });
          return data;
        } catch (error) {
          handleApiError(error, set);
          return get().webdavShares;
        } finally {
          set({ isWebdavSharesLoading: false });
        }
      },

      setSelectedWebdavShare: (webdavShare) => {
        set({ selectedWebdavShare: webdavShare });
      },

      setForceCleanupCache: (forceCleanupCache) => {
        set({ forceCleanupCache });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'filesharing-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mountPoints: state.mountPoints,
      }),
    },
  ),
);

export default useFileSharingStore;
