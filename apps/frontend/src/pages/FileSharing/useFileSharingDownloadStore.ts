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
import SMOOTHING_ALPHA from '@libs/filesharing/constants/smoothingAlpha';

type FileSharingDownloadStore = {
  isCreatingBlobUrl: boolean;
  isFetchingPublicUrl: boolean;
  temporaryDownloadUrl: string;
  publicDownloadLink: string | null;
  isEditorLoading: boolean;
  error: Error | null;
  downloadProgress: DownloadFileDto;
  setDownloadProgress: (progress: DownloadFileDto) => void;
  createDownloadBlobUrl: (
    filePath: string,
    share: string | undefined,
    signal?: AbortSignal,
  ) => Promise<string | undefined>;
  getPublicDownloadUrl: (
    filePath: string,
    filename: string,
    share: string | undefined,
    signal?: AbortSignal,
  ) => Promise<string | undefined>;
  loadDownloadUrl: (file: DirectoryFileDTO | null, share: string | undefined, signal?: AbortSignal) => Promise<void>;
  downloadFile: (
    file: DirectoryFileDTO,
    share: string | undefined,
    signal?: AbortSignal,
  ) => Promise<string | undefined>;
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

  loadDownloadUrl: async (file, share, signal) => {
    try {
      set({ isCreatingBlobUrl: true, error: null, temporaryDownloadUrl: '', publicDownloadLink: null });

      if (!file) return;

      const blobUrl = await get().createDownloadBlobUrl(file.filePath, share, signal);
      set({ temporaryDownloadUrl: blobUrl });

      if (isOnlyOfficeDocument(file.filename)) {
        const publicUrl = await get().getPublicDownloadUrl(file.filePath, file.filePath, share, signal);
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

  createDownloadBlobUrl: async (filePath, share, signal) => {
    try {
      set({ isCreatingBlobUrl: true });
      const response = await eduApi.get<Blob>(
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.FILE_STREAM}`,
        {
          params: { filePath, share },
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

  getPublicDownloadUrl: async (filePath, filename, share, signal) => {
    try {
      set({ isFetchingPublicUrl: true });
      const response = await eduApi.get<WebdavStatusResponse>(
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.FILE_LOCATION}`,
        {
          params: { filePath, fileName: filename, share },
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

  downloadFile: async (file, share, signal) => {
    try {
      set({ isFetchingPublicUrl: true, error: null });

      const totalBytesFallback = file.size ?? 0;
      const processId = Math.floor(Math.random() * 1_000_000);
      const startedAt = Date.now();

      let lastTs = startedAt;
      let lastLoaded = 0;
      let smoothedBps: number | undefined;

      const formatFileName = () => (file.type === ContentType.DIRECTORY ? `${file.filename}.zip` : file.filename);

      get().setDownloadProgress({
        fileName: formatFileName(),
        percent: 0,
        processId,
        totalBytes: totalBytesFallback,
        loadedBytes: 0,
        speedBps: 0,
        etaSeconds: undefined,
        lastUpdateAt: startedAt,
        startedAt,
        speedFormatted: formatTransferSpeed(0),
        etaFormatted: formatEstimatedTimeRemaining(undefined),
      });

      const onProgress = (progressEvent: AxiosProgressEvent) => {
        const { loaded = 0, total = totalBytesFallback } = progressEvent;
        if (!total) return;

        const currentTs = Date.now();

        const percent = Math.min(100, Math.round((loaded / total) * 100));

        const dtMs = Math.max(1, currentTs - lastTs);
        const dBytes = Math.max(0, loaded - lastLoaded);
        const instBps = (dBytes * 1000) / dtMs;

        smoothedBps = smoothedBps ? SMOOTHING_ALPHA * instBps + (1 - SMOOTHING_ALPHA) * smoothedBps : instBps;

        const remaining = Math.max(0, total - loaded);
        const etaSec = smoothedBps > 0 ? remaining / smoothedBps : undefined;

        get().setDownloadProgress({
          fileName: formatFileName(),
          percent,
          processId,
          totalBytes: total,
          loadedBytes: loaded,
          speedBps: smoothedBps,
          etaSeconds: etaSec,
          lastUpdateAt: currentTs,
          startedAt,
          speedFormatted: formatTransferSpeed(smoothedBps),
          etaFormatted: formatEstimatedTimeRemaining(etaSec),
        });

        lastTs = currentTs;
        lastLoaded = loaded;
      };

      const { data } = await eduApi.get<Blob>(
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.FILE_STREAM}`,
        {
          responseType: ResponseType.BLOB,
          signal,
          params: { filePath: file.filePath, share },
          onDownloadProgress: onProgress,
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
