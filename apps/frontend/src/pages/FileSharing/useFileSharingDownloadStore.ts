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

import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import { create } from 'zustand';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';
import getFrontEndUrl from '@libs/common/utils/URL/getFrontEndUrl';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { ResponseType } from '@libs/common/types/http-methods';
import { WebdavStatusResponse } from '@libs/filesharing/types/fileOperationResult';
import DownloadFileDto from '@libs/filesharing/types/downloadFileDto';
import { AxiosProgressEvent } from 'axios';

type FileSharingDownloadStore = {
  isCreatingBlobUrl: boolean;
  isFetchingPublicUrl: boolean;
  temporaryDownloadUrl: string;
  publicDownloadLink: string | null;
  isEditorLoading: boolean;
  error: Error | null;
  downloadProgress: DownloadFileDto;
  setDownloadProgress: (progress: DownloadFileDto) => void;
  createDownloadBlobUrl: (filePath: string, signal?: AbortSignal) => Promise<string | undefined>;
  getPublicDownloadUrl: (filePath: string, filename: string, signal?: AbortSignal) => Promise<string | undefined>;
  loadDownloadUrl: (file: DirectoryFileDTO | null, signal?: AbortSignal) => Promise<void>;
  loadDownloadUrlMultipleFiles: (file: DirectoryFileDTO[], signal?: AbortSignal) => Promise<string | undefined>;
  setPublicDownloadLink: (publicDownloadLink: string) => void;
  reset: () => void;
};

const initialState = {
  temporaryDownloadUrl: '',
  downloadProgress: {} as DownloadFileDto,
  publicDownloadLink: null,
  isCreatingBlobUrl: false,
  isFetchingPublicUrl: false,
  isEditorLoading: false,
  error: null,
};

const useFileSharingDownloadStore = create<FileSharingDownloadStore>((set, get) => ({
  ...initialState,

  reset: () => set(initialState),
  setPublicDownloadLink: (publicDownloadLink) => set({ publicDownloadLink }),

  setDownloadProgress: (progress) => {
    set({ downloadProgress: progress });
  },

  loadDownloadUrl: async (file, signal) => {
    try {
      set({ isCreatingBlobUrl: true, error: null, temporaryDownloadUrl: '', publicDownloadLink: null });

      if (!file) return;

      const blobUrl = await get().createDownloadBlobUrl(file.filePath, signal);
      set({ temporaryDownloadUrl: blobUrl });

      if (isOnlyOfficeDocument(file.filename)) {
        const publicUrl = await get().getPublicDownloadUrl(file.filePath, file.filePath, signal);
        if (publicUrl) {
          set({ publicDownloadLink: `${getFrontEndUrl()}/${EDU_API_ROOT}/downloads/${publicUrl}` });
        }
      }
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isCreatingBlobUrl: false });
    }
  },

  createDownloadBlobUrl: async (filePath, signal) => {
    try {
      set({ isCreatingBlobUrl: true });
      const response = await eduApi.get<Blob>(
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.FILE_STREAM}`,
        {
          params: { filePath },
          responseType: ResponseType.BLOB,
          signal,
        },
      );
      return window.URL.createObjectURL(response.data);
    } catch (error) {
      handleApiError(error, set);
      return '';
    } finally {
      set({ isCreatingBlobUrl: false });
    }
  },

  getPublicDownloadUrl: async (filePath, filename, signal) => {
    try {
      set({ isFetchingPublicUrl: true });
      const response = await eduApi.get<WebdavStatusResponse>(
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.FILE_LOCATION}`,
        {
          params: { filePath, fileName: filename },
          signal,
        },
      );
      const { data, success } = response.data;
      return success && data ? data : '';
    } catch (error) {
      handleApiError(error, set);
      return '';
    } finally {
      set({ isFetchingPublicUrl: false });
    }
  },

  loadDownloadUrlMultipleFiles: async (files: DirectoryFileDTO[], signal?: AbortSignal) => {
    try {
      set({ isFetchingPublicUrl: true });
      const params = new URLSearchParams();
      files.forEach((f) => params.append('filePath', f.filename));

      const totalBytes = files.reduce((size, file) => size + (file.size ?? 0), 0);

      const { data } = await eduApi.get<Blob>(
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.FILE_STREAM}`,
        {
          responseType: ResponseType.BLOB,
          signal,
          params: { filePath: files.map((file) => file.filePath) },
          onDownloadProgress: (e: AxiosProgressEvent) => {
            const total = e.total ?? totalBytes;
            if (!total) return;
            let percent = Math.round((e.loaded / total) * 100);
            if (percent > 100) percent = 100;
            get().setDownloadProgress({
              fileName: files.length > 1 ? 'download.zip' : files[0].filename,
              percent,
              processId: Math.floor(Math.random() * 1_000_000),
            });
          },
        },
      );

      return URL.createObjectURL(data);
    } catch (error) {
      handleApiError(error, set);
      return '';
    } finally {
      set({ isFetchingPublicUrl: false });
    }
  },
}));

export default useFileSharingDownloadStore;
