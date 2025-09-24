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
import ContentType from '@libs/filesharing/types/contentType';
import formatTransferSpeed from '@libs/filesharing/utils/formatTransferSpeed';
import formatEstimatedTimeRemaining from '@libs/filesharing/utils/formatEstimatedTimeRemaining';

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
  downloadFile: (file: DirectoryFileDTO, signal?: AbortSignal) => Promise<string | undefined>;
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

  downloadFile: async (file, signal) => {
    try {
      set({ isFetchingPublicUrl: true, error: null });

      const totalBytes = file.size ?? 0;
      const processId = Math.floor(Math.random() * 1_000_000);
      const startedAt = Date.now();

      let lastTimestampMilliseconds = startedAt;
      let lastLoadedBytes = 0;
      let smoothedBytesPerSecond: number | undefined;

      get().setDownloadProgress({
        fileName: file.type === ContentType.DIRECTORY ? `${file.filename}.zip` : file.filename,
        percent: 0,
        processId,
        totalBytes,
        loadedBytes: 0,
        speedBps: 0,
        etaSeconds: undefined,
        lastUpdateAt: startedAt,
        startedAt,
        speedFormatted: formatTransferSpeed(0),
        etaFormatted: formatEstimatedTimeRemaining(undefined),
      });

      const { data } = await eduApi.get<Blob>(
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.FILE_STREAM}`,
        {
          responseType: ResponseType.BLOB,
          signal,
          params: { filePath: file.filePath },
          onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
            const totalBytesResolved = progressEvent.total ?? totalBytes;
            if (!totalBytesResolved) return;

            const loadedBytesResolved = progressEvent.loaded ?? 0;
            let percent = Math.round((loadedBytesResolved / totalBytesResolved) * 100);
            if (percent > 100) percent = 100;

            const currentTimestampMilliseconds = Date.now();
            const deltaMilliseconds = Math.max(1, currentTimestampMilliseconds - lastTimestampMilliseconds);
            const deltaBytes = Math.max(0, loadedBytesResolved - lastLoadedBytes);

            const instantaneousBytesPerSecond = (deltaBytes * 1000) / deltaMilliseconds;

            const smoothingFactor = 0.2;
            smoothedBytesPerSecond = smoothedBytesPerSecond
              ? smoothingFactor * instantaneousBytesPerSecond + (1 - smoothingFactor) * smoothedBytesPerSecond
              : instantaneousBytesPerSecond;

            const remainingBytes = Math.max(0, totalBytesResolved - loadedBytesResolved);
            const estimatedSecondsRemaining =
              smoothedBytesPerSecond > 0 ? remainingBytes / smoothedBytesPerSecond : undefined;

            const speedFormatted = formatTransferSpeed(smoothedBytesPerSecond);
            const etaFormatted = formatEstimatedTimeRemaining(estimatedSecondsRemaining);

            get().setDownloadProgress({
              fileName: file.type === ContentType.DIRECTORY ? `${file.filename}.zip` : file.filename,
              percent,
              processId,
              totalBytes: totalBytesResolved,
              loadedBytes: loadedBytesResolved,
              speedBps: smoothedBytesPerSecond,
              etaSeconds: estimatedSecondsRemaining,
              lastUpdateAt: currentTimestampMilliseconds,
              startedAt,
              speedFormatted,
              etaFormatted,
            });

            lastTimestampMilliseconds = currentTimestampMilliseconds;
            lastLoadedBytes = loadedBytesResolved;
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
