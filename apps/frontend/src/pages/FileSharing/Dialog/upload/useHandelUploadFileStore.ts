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

import { create } from 'zustand';
import type { AxiosProgressEvent } from 'axios';
import { UploadFile } from '@libs/filesharing/types/uploadFile';
import buildApiFileTypePathUrl from '@libs/filesharing/utils/buildApiFileTypePathUrl';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import eduApi from '@/api/eduApi';
import UploadStatus from '@libs/filesharing/types/uploadStatus';
import FileProgress from '@libs/filesharing/types/fileProgress';
import UploadResult from '@libs/filesharing/types/uploadResult';
import UploadFileParams from '@libs/filesharing/types/uploadFileParams';

interface HandelUploadFileStore {
  isUploadDialogOpen: boolean;
  filesToUpload: UploadFile[];
  isUploading: boolean;
  lastError?: string;
  progressByName: Record<string, FileProgress>;

  setIsUploadDialogOpen: (isOpen: boolean) => void;
  closeUploadDialog: () => void;
  setFilesToUpload: (files: UploadFile[]) => void;
  updateFilesToUpload: (updater: (files: UploadFile[]) => UploadFile[]) => void;

  uploadFiles: (params: UploadFileParams) => Promise<UploadResult[]>;
  reset: () => void;
}

const initialState = {
  isUploadDialogOpen: false,
  filesToUpload: [] as UploadFile[],
  isUploading: false,
  lastError: undefined as string | undefined,
  progressByName: {} as Record<string, FileProgress>,
};

const useHandelUploadFileStore = create<HandelUploadFileStore>((set, get) => ({
  ...initialState,

  uploadFiles: async ({ endpoint, type, destinationPath, parallel = true }) => {
    const filesSelectedForUpload = get().filesToUpload;
    if (!filesSelectedForUpload || filesSelectedForUpload.length === 0) return [];

    set({ isUploading: true, lastError: undefined });

    const sanitizedDestinationPath = getPathWithoutWebdav(destinationPath);
    const uploadEndpointPath = buildApiFileTypePathUrl(endpoint, type, sanitizedDestinationPath);

    const setProgressForFile = (fileName: string, next: FileProgress) =>
      set((state) => ({
        progressByName: {
          ...state.progressByName,
          [fileName]: next,
        },
      }));

    const uploadSingleFile = async (fileItem: UploadFile): Promise<UploadResult> => {
      const fileName = fileItem.name;
      const startTimestamp = Date.now();

      let lastLoadedByteCount = 0;
      let lastTimestamp = startTimestamp;
      let smoothedBytesPerSecond = 0;

      setProgressForFile(fileName, {
        status: UploadStatus.uploading,
        loadedByteCount: 0,
        totalByteCount: fileItem.size,
        percentageComplete: 0,
        bytesPerSecond: 0,
        estimatedSecondsRemaining: undefined,
        startedAtTimestampMs: startTimestamp,
        lastUpdateTimestampMs: startTimestamp,
      });

      const formData = new FormData();
      formData.append(
        'uploadFileDto',
        JSON.stringify({
          name: fileItem.name,
          isZippedFolder: fileItem.isZippedFolder === true,
          ...(fileItem.originalFolderName && { originalFolderName: fileItem.originalFolderName }),
        }),
      );
      formData.append('currentPath', destinationPath);
      formData.append('path', destinationPath);
      formData.append('file', fileItem);

      try {
        await eduApi.post(uploadEndpointPath, formData, {
          params: { showUploadProgress: true, declaredSize: fileItem.size },
          withCredentials: true,
          onUploadProgress: (event: AxiosProgressEvent) => {
            const now = Date.now();

            const totalByteCount = event.total ?? fileItem.size;
            const loadedByteCount = event.loaded ?? 0;

            const elapsedSeconds = Math.max(1e-3, (now - lastTimestamp) / 1000);
            const transferredBytesSinceLast = Math.max(0, loadedByteCount - lastLoadedByteCount);

            const instantaneousBytesPerSecond =
              transferredBytesSinceLast > 0 ? transferredBytesSinceLast / elapsedSeconds : 0;

            smoothedBytesPerSecond =
              smoothedBytesPerSecond === 0
                ? instantaneousBytesPerSecond
                : 0.3 * instantaneousBytesPerSecond + 0.7 * smoothedBytesPerSecond;

            const remainingBytes = Math.max(0, totalByteCount - loadedByteCount);
            const estimatedSecondsRemaining =
              smoothedBytesPerSecond > 0 ? remainingBytes / smoothedBytesPerSecond : undefined;

            const percentageComplete =
              totalByteCount > 0 ? Math.min(99, Math.floor((loadedByteCount / totalByteCount) * 100)) : 0;

            setProgressForFile(fileName, {
              status: UploadStatus.uploading,
              loadedByteCount,
              totalByteCount,
              percentageComplete,
              bytesPerSecond: smoothedBytesPerSecond,
              estimatedSecondsRemaining,
              startedAtTimestampMs: startTimestamp,
              lastUpdateTimestampMs: now,
            });

            lastLoadedByteCount = loadedByteCount;
            lastTimestamp = now;
          },
        });

        setProgressForFile(fileName, {
          status: UploadStatus.done,
          loadedByteCount: fileItem.size,
          totalByteCount: fileItem.size,
          percentageComplete: 100,
          bytesPerSecond: 0,
          estimatedSecondsRemaining: 0,
          startedAtTimestampMs: startTimestamp,
          lastUpdateTimestampMs: Date.now(),
        });

        return { name: fileName, ok: true };
      } catch (error) {
        setProgressForFile(fileName, {
          status: UploadStatus.error,
          loadedByteCount: lastLoadedByteCount,
          totalByteCount: fileItem.size,
          percentageComplete: fileItem.size > 0 ? Math.floor((lastLoadedByteCount / fileItem.size) * 100) : 0,
          bytesPerSecond: 0,
          estimatedSecondsRemaining: undefined,
          startedAtTimestampMs: startTimestamp,
          lastUpdateTimestampMs: Date.now(),
        });
        return {
          name: fileName,
          ok: false,
          error: error instanceof Error ? error.message : 'upload_failed',
        };
      }
    };

    try {
      let outcomes: UploadResult[];
      if (parallel) {
        const settled = await Promise.allSettled(filesSelectedForUpload.map(uploadSingleFile));
        outcomes = settled.map((r, i) =>
          r.status === 'fulfilled'
            ? r.value
            : { name: filesSelectedForUpload[i].name, ok: false, error: String(r.reason) },
        );
      } else {
        outcomes = await filesSelectedForUpload.reduce<Promise<UploadResult[]>>(
          async (previousResultsPromise, fileItem) => {
            const results = await previousResultsPromise;
            const uploadOutcome = await uploadSingleFile(fileItem);
            return [...results, uploadOutcome];
          },
          Promise.resolve([] as UploadResult[]),
        );
      }

      const firstFailureMessage = outcomes.find((result) => !result.ok)?.error;
      if (firstFailureMessage) set({ lastError: firstFailureMessage });

      return outcomes;
    } finally {
      set({ isUploading: false });
    }
  },

  setIsUploadDialogOpen: (isOpen) => set({ isUploadDialogOpen: isOpen }),
  closeUploadDialog: () => set({ isUploadDialogOpen: false }),
  setFilesToUpload: (files) => set({ filesToUpload: files }),
  updateFilesToUpload: (updater) => set((state) => ({ filesToUpload: updater(state.filesToUpload) })),
  reset: () => set(initialState),
}));

export default useHandelUploadFileStore;
