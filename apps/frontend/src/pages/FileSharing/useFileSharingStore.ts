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
  setDirectories: (files: DirectoryFileDTO[]) => void;
  directories: DirectoryFileDTO[];
  selectedRows: RowSelectionState;
  setSelectedRows: (rows: RowSelectionState) => void;
  setCurrentPath: (path: string) => void;
  setPathToRestoreSession: (path: string) => void;
  setFiles: (files: DirectoryFileDTO[]) => void;
  setSelectedItems: (items: DirectoryFileDTO[]) => void;
  fetchFiles: (shareName: string | undefined, path?: string) => Promise<void>;
  fetchMountPoints: (shareName: string | undefined) => Promise<DirectoryFileDTO[]>;
  reset: () => void;
  mountPoints: DirectoryFileDTO[];
  isLoading: boolean;
  isError: boolean;
  currentlyDisabledFiles: Record<string, boolean>;
  setFileIsCurrentlyDisabled: (filename: string, isLocked: boolean, durationMs?: number) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
  setMountPoints: (mountPoints: DirectoryFileDTO[]) => void;
  setFileOperationProgress: (progress: FilesharingProgressDto | null) => void;
  setDownloadProgressList: (progressList: DownloadFileDto[]) => void;
  updateDownloadProgress: (progress: DownloadFileDto) => void;
  removeDownloadProgress: (fileName: string) => void;
  webdavShares: WebdavShareDto[];
  fetchWebdavShares: () => Promise<WebdavShareDto[]>;
  selectedWebdavShare: string;
  setSelectedWebdavShare: (webdavShare: string) => void;
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
  isError: false,
  currentlyDisabledFiles: {},
  downloadProgressList: [],
  fileOperationProgress: null,
  webdavShares: [],
  selectedWebdavShare: '',
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
      setFiles: (files: DirectoryFileDTO[]) => {
        set({ files });
      },

      setMountPoints: (mountPoints: DirectoryFileDTO[]) => {
        set({ mountPoints });
      },

      setDirectories: (directories: DirectoryFileDTO[]) => {
        set({ directories });
      },

      setIsLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      fetchFiles: async (shareName, path: string = '/') => {
        try {
          set({ isLoading: true });
          const { data } = await eduApi.get<DirectoryFileDTO[]>(FileSharingApiEndpoints.BASE, {
            params: { type: ContentType.FILE, path, share: shareName },
          });

          const webdavShareType = get().webdavShares[0]?.type;
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

      fetchMountPoints: async (shareName) => {
        try {
          set({ isLoading: true });

          const { data } = await eduApi.get<DirectoryFileDTO[]>(FileSharingApiEndpoints.BASE, {
            params: { type: ContentType.DIRECTORY, path: '/', share: shareName },
          });

          const webdavShareType = get().webdavShares[0]?.type;
          const mountPoints = processWebdavResponse(data, webdavShareType);

          set({ mountPoints });
          return mountPoints;
        } catch (error) {
          handleApiError(error, set);
          return get().mountPoints;
        } finally {
          set({ isLoading: false });
        }
      },

      setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
      setSelectedItems: (items: DirectoryFileDTO[]) => set({ selectedItems: items }),

      fetchWebdavShares: async () => {
        try {
          set({ isLoading: true });

          const { data } = await eduApi.get<WebdavShareDto[]>('/webdav-shares');
          set({
            webdavShares: data,
          });
          return data;
        } catch (error) {
          handleApiError(error, set);
          return get().webdavShares;
        } finally {
          set({ isLoading: false });
        }
      },

      setSelectedWebdavShare: (webdavShare) => {
        set({ selectedWebdavShare: webdavShare });
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
