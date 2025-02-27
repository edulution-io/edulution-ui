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
import { WebdavStatusResponse } from '@libs/filesharing/types/fileOperationResult';
import buildApiFileTypePathUrl from '@libs/filesharing/utils/buildApiFileTypePathUrl';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';
import getFrontEndUrl from '@libs/common/utils/getFrontEndUrl';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import delay from '@libs/common/utils/delay';
import { ResponseType } from '@libs/common/types/http-methods';

type UseFileSharingStore = {
  files: DirectoryFileDTO[];
  selectedItems: DirectoryFileDTO[];
  currentPath: string;
  currentlyEditingFile: DirectoryFileDTO | null;
  pathToRestoreSession: string;
  setDirectorys: (files: DirectoryFileDTO[]) => void;
  directorys: DirectoryFileDTO[];
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
  isEditorLoading: boolean;
  downloadLinkURL: string;
  publicDownloadLink: string | null;
  setPublicDownloadLink: (publicDownloadLink: string) => void;
  isError: boolean;
  currentlyDisabledFiles: Record<string, boolean>;
  startFileIsCurrentlyDisabled: (filename: string, isLocked: boolean, durationMs: number) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
  setCurrentlyEditingFile: (fileToPreview: DirectoryFileDTO | null) => void;
  resetCurrentlyEditingFile: (fileToPreview: DirectoryFileDTO | null) => Promise<void>;
  setMountPoints: (mountPoints: DirectoryFileDTO[]) => void;
  downloadFile: (filePath: string) => Promise<string | undefined>;
  getDownloadLinkURL: (filePath: string, filename: string) => Promise<string | undefined>;
  fetchDownloadLinks: (file: DirectoryFileDTO | null) => Promise<void>;
  isFullScreenEditingEnabled: boolean;
  setIsFullScreenEditingEnabled: (isFullScreenEditingEnabled: boolean) => void;
};

const initialState = {
  files: [],
  selectedItems: [],
  currentPath: `/`,
  pathToRestoreSession: `/`,
  downloadLinkURL: '',
  selectedRows: {},
  currentlyEditingFile: null,
  mountPoints: [],
  directorys: [],
  isLoading: false,
  isError: false,
  publicDownloadLink: null,
  isEditorLoading: false,
  isFullScreenEditingEnabled: false,
  currentlyDisabledFiles: {},
};

type PersistedFileManagerStore = (
  fileManagerData: StateCreator<UseFileSharingStore>,
  options: PersistOptions<Partial<UseFileSharingStore>>,
) => StateCreator<UseFileSharingStore>;

const useFileSharingStore = create<UseFileSharingStore>(
  (persist as PersistedFileManagerStore)(
    (set, get) => ({
      ...initialState,
      setIsFullScreenEditingEnabled: (isFullScreenEditingEnabled) => set({ isFullScreenEditingEnabled }),
      setCurrentPath: (path: string) => {
        set({ currentPath: path });
      },

      setPublicDownloadLink: (publicDownloadLink) => set({ publicDownloadLink }),

      fetchDownloadLinks: async (file: DirectoryFileDTO | null) => {
        try {
          set({ isEditorLoading: true, isError: false, downloadLinkURL: undefined, publicDownloadLink: null });

          if (!file) {
            set({ isEditorLoading: false });
            return;
          }

          const downloadLink = await get().downloadFile(file.filename);
          set({ downloadLinkURL: downloadLink });

          if (isOnlyOfficeDocument(file.filename)) {
            const publicLink = await get().getDownloadLinkURL(file.filename, file.basename);
            set({ publicDownloadLink: `${getFrontEndUrl()}/${EDU_API_ROOT}/downloads/${publicLink}` || ' ' });
          }

          set({ isEditorLoading: false });
        } catch (error) {
          handleApiError(error, set);
          set({ isError: true, isEditorLoading: false });
        }
      },

      setCurrentlyEditingFile: (fileToPreview: DirectoryFileDTO | null) => {
        set({ currentlyEditingFile: fileToPreview });
      },

      resetCurrentlyEditingFile: async (fileToPreview: DirectoryFileDTO | null) => {
        set({ currentlyEditingFile: null });
        await delay(1);
        set({ currentlyEditingFile: fileToPreview });
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

      setDirectorys: (directorys: DirectoryFileDTO[]) => {
        set({ directorys });
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

      downloadFile: async (filePath: string) => {
        try {
          set({ isLoading: true });
          const fileStreamResponse = await eduApi.get<Blob>(
            `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.FILE_STREAM}`,
            {
              params: { filePath },
              responseType: ResponseType.BLOB,
            },
          );

          const fileStream = fileStreamResponse.data;
          return window.URL.createObjectURL(fileStream);
        } catch (error) {
          handleApiError(error, set);
          return '';
        } finally {
          set({ isLoading: false });
        }
      },

      getDownloadLinkURL: async (filePath: string, filename: string) => {
        try {
          set({ isLoading: true });
          const response = await eduApi.get<WebdavStatusResponse>(
            `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.FILE_LOCATION}`,
            {
              params: {
                filePath,
                fileName: filename,
              },
            },
          );
          const { data, success } = response.data;
          if (success && data) {
            return data;
          }
          return '';
        } catch (error) {
          handleApiError(error, set);
          return '';
        } finally {
          set({ isLoading: false });
        }
      },

      startFileIsCurrentlyDisabled: async (filename, isLocked, durationMs) => {
        set((state) => ({
          currentlyDisabledFiles: {
            ...state.currentlyDisabledFiles,
            [filename]: isLocked,
          },
        }));
        if (durationMs) {
          await delay(durationMs);
          set({ currentlyDisabledFiles: { filename: !isLocked } });
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
          set({ directorys: directoryFiles.data });
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
        currentlyEditingFile: state.currentlyEditingFile,
      }),
    },
  ),
);

export default useFileSharingStore;
