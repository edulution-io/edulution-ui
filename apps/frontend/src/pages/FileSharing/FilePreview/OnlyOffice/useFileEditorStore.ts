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

import { create, StateCreator } from 'zustand';
import eduApi from '@/api/eduApi';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { RequestResponseContentType, ResponseType } from '@libs/common/types/http-methods';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';
import buildApiDeletePathUrl from '@libs/filesharing/utils/buildApiDeletePathUrl';
import DeleteTargetType from '@libs/filesharing/types/deleteTargetType';
import getLastPartOfUrl from '@libs/filesharing/utils/getLastPartOfUrl';
import handleApiError from '@/utils/handleApiError';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { WebdavStatusReplay } from '@libs/filesharing/types/fileOperationResult';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';
import getFrontEndUrl from '@libs/common/utils/getFrontEndUrl';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import delay from '@libs/common/utils/delay';

type FileEditorStore = {
  isFilePreviewDocked: boolean;
  setIsFilePreviewDocked: (isFilePreviewDocked: boolean) => void;
  isFilePreviewVisible: boolean;
  setIsFilePreviewVisible: (isVisible: boolean) => void;
  getOnlyOfficeJwtToken: (config: OnlyOfficeEditorConfig) => Promise<string>;
  deleteFileAfterEdit: (url: string) => Promise<void>;
  reset: () => void;
  error: Error | null;
  downloadFile: (filePath: string, signal?: AbortSignal) => Promise<string | undefined>;
  getDownloadLinkURL: (filePath: string, filename: string, signal?: AbortSignal) => Promise<string | undefined>;
  fetchDownloadLinks: (file: DirectoryFileDTO | null, signal?: AbortSignal) => Promise<void>;
  currentlyEditingFile: DirectoryFileDTO | null;
  filesToOpenInNewTab: DirectoryFileDTO[];
  addFileToOpenInNewTab: (fileToPreview: DirectoryFileDTO) => void;
  setCurrentlyEditingFile: (fileToPreview: DirectoryFileDTO | null) => void;
  resetCurrentlyEditingFile: (fileToPreview: DirectoryFileDTO | null) => Promise<void>;
  isEditorLoading: boolean;
  isDownloadFileLoading: boolean;
  downloadLinkURL: string;
  publicDownloadLink: string | null;
  isGetDownloadLinkUrlLoading: boolean;
  setPublicDownloadLink: (publicDownloadLink: string) => void;
};

const initialState = {
  isFilePreviewDocked: true,
  isFilePreviewVisible: false,
  publicDownloadLink: null,
  isEditorLoading: false,
  downloadLinkURL: '',
  currentlyEditingFile: null,
  filesToOpenInNewTab: [],
  isDownloadFileLoading: false,
  isGetDownloadLinkUrlLoading: false,
  error: null,
};

type PersistedFileEditorStore = (
  fileManagerData: StateCreator<FileEditorStore>,
  options: PersistOptions<Partial<FileEditorStore>>,
) => StateCreator<FileEditorStore>;

const useFileEditorStore = create<FileEditorStore>(
  (persist as PersistedFileEditorStore)(
    (set, get) => ({
      ...initialState,
      reset: () => set(initialState),

      setIsFilePreviewDocked: (isFilePreviewDocked) => set({ isFilePreviewDocked }),

      setIsFilePreviewVisible: (isFilePreviewVisible) => set({ isFilePreviewVisible }),

      deleteFileAfterEdit: async (url) => {
        try {
          await eduApi.delete(
            buildApiDeletePathUrl(FileSharingApiEndpoints.BASE, getLastPartOfUrl(url), DeleteTargetType.LOCAL),
          );
        } catch (error) {
          handleApiError(error, set);
        }
        return Promise.resolve();
      },

      getOnlyOfficeJwtToken: async (config) => {
        try {
          const response = await eduApi.post<string>(
            `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.ONLY_OFFICE_TOKEN}`,
            JSON.stringify(config),
            {
              headers: {
                'Content-Type': RequestResponseContentType.APPLICATION_JSON,
              },
            },
          );
          return response.data;
        } catch (error) {
          handleApiError(error, set);
        }
        return Promise.resolve('');
      },

      setPublicDownloadLink: (publicDownloadLink) => set({ publicDownloadLink }),

      fetchDownloadLinks: async (file, signal) => {
        try {
          set({ isEditorLoading: true, error: null, downloadLinkURL: undefined, publicDownloadLink: null });

          if (!file) {
            return;
          }

          const downloadLink = await get().downloadFile(file.filename, signal);
          set({ downloadLinkURL: downloadLink });

          if (isOnlyOfficeDocument(file.filename)) {
            const publicLink = await get().getDownloadLinkURL(file.filename, file.basename, signal);
            if (publicLink) {
              set({ publicDownloadLink: `${getFrontEndUrl()}/${EDU_API_ROOT}/downloads/${publicLink}` });
            }
          }
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isEditorLoading: false });
        }
      },

      addFileToOpenInNewTab: (file) => {
        const filteredFiles = get().filesToOpenInNewTab.filter((f) => f.etag !== file?.etag);
        set({ filesToOpenInNewTab: [...filteredFiles, file] });
      },

      setCurrentlyEditingFile: (file) => {
        set({ currentlyEditingFile: file });
      },

      resetCurrentlyEditingFile: async (file) => {
        set({ currentlyEditingFile: null });
        await delay(1);
        set({ currentlyEditingFile: file });
      },

      downloadFile: async (filePath, signal) => {
        try {
          set({ isDownloadFileLoading: true });
          const fileStreamResponse = await eduApi.get<Blob>(
            `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.FILE_STREAM}`,
            {
              params: { filePath },
              responseType: ResponseType.BLOB,
              signal,
            },
          );

          return window.URL.createObjectURL(fileStreamResponse.data);
        } catch (error) {
          handleApiError(error, set);
          return '';
        } finally {
          set({ isDownloadFileLoading: false });
        }
      },

      getDownloadLinkURL: async (filePath, filename, signal) => {
        try {
          set({ isGetDownloadLinkUrlLoading: true });
          const response = await eduApi.get<WebdavStatusReplay>(
            `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.FILE_LOCATION}`,
            {
              params: {
                filePath,
                fileName: filename,
              },
              signal,
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
          set({ isGetDownloadLinkUrlLoading: false });
        }
      },
    }),
    {
      name: 'filesharing-editor-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filesToOpenInNewTab: state.filesToOpenInNewTab,
      }),
    },
  ),
);

export default useFileEditorStore;
