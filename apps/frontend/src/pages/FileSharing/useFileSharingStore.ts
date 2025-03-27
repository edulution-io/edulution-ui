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
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import buildApiFileTypePathUrl from '@libs/filesharing/utils/buildApiFileTypePathUrl';
import delay from '@libs/common/utils/delay';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';

type UseFileSharingStore = {
  files: DirectoryFileDTO[];
  selectedItems: DirectoryFileDTO[];
  currentPath: string;
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
  fetchFiles: (path?: string) => Promise<void>;
  fetchMountPoints: () => Promise<void>;
  fetchDirs: (path: string) => Promise<void>;
  reset: () => void;
  mountPoints: DirectoryFileDTO[];
  isLoading: boolean;
  isError: boolean;
  currentlyDisabledFiles: Record<string, boolean>;
  setFileIsCurrentlyDisabled: (filename: string, isLocked: boolean, durationMs?: number) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
  setMountPoints: (mountPoints: DirectoryFileDTO[]) => void;
  setFileOperationProgress: (progress: FilesharingProgressDto | null) => void;
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
  fileOperationProgress: null,
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

      fetchFiles: async (path: string = '/') => {
        try {
          set({ isLoading: true });
          const directoryFiles = await eduApi.get<DirectoryFileDTO[]>(
            `${buildApiFileTypePathUrl(FileSharingApiEndpoints.BASE, ContentType.FILE, path)}`,
          );
          set({
            currentPath: path,
            files: directoryFiles.data,
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

      fetchMountPoints: async () => {
        try {
          set({ isLoading: true });
          const resp = await eduApi.get<DirectoryFileDTO[]>(
            `${buildApiFileTypePathUrl(FileSharingApiEndpoints.BASE, ContentType.FILE, '')}`,
          );
          set({ mountPoints: resp.data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchDirs: async (path: string) => {
        try {
          const directoryFiles = await eduApi.get<DirectoryFileDTO[]>(
            `${buildApiFileTypePathUrl(FileSharingApiEndpoints.BASE, ContentType.DIRECTORY, getPathWithoutWebdav(path))}`,
          );
          set({ directories: directoryFiles.data });
        } catch (error) {
          handleApiError(error, set);
        }
      },

      setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
      setSelectedItems: (items: DirectoryFileDTO[]) => set({ selectedItems: items }),

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
