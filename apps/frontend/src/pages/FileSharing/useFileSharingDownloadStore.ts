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
import getFrontEndUrl from '@libs/common/utils/getFrontEndUrl';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { ResponseType } from '@libs/common/types/http-methods';
import { WebdavStatusResponse } from '@libs/filesharing/types/fileOperationResult';

type FileSharingDownloadStore = {
  isDownloadFileLoading: boolean;
  downloadLinkURL: string;
  publicDownloadLink: string | null;
  isFetchDownloadLinkLoading: boolean;
  isEditorLoading: boolean;
  error: Error | null;
  downloadFile: (filePath: string, signal?: AbortSignal) => Promise<string | undefined>;
  getDownloadLinkURL: (filePath: string, filename: string, signal?: AbortSignal) => Promise<string | undefined>;
  fetchDownloadLink: (file: DirectoryFileDTO | null, signal?: AbortSignal) => Promise<void>;
  setPublicDownloadLink: (publicDownloadLink: string) => void;
  reset: () => void;
};

const initialState = {
  publicDownloadLink: null,
  isEditorLoading: false,
  downloadLinkURL: '',
  isDownloadFileLoading: false,
  isFetchDownloadLinkLoading: false,
  error: null,
};

const useFileSharingDownloadStore = create<FileSharingDownloadStore>((set, get) => ({
  ...initialState,

  reset: () => set(initialState),

  setPublicDownloadLink: (publicDownloadLink) => set({ publicDownloadLink }),

  fetchDownloadLink: async (file, signal) => {
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
      set({ isFetchDownloadLinkLoading: true });
      const response = await eduApi.get<WebdavStatusResponse>(
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
      set({ isFetchDownloadLinkLoading: false });
    }
  },
}));

export default useFileSharingDownloadStore;
