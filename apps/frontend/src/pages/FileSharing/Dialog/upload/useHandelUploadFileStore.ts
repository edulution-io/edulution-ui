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
import type { AxiosInstance, AxiosProgressEvent } from 'axios';

import { UploadFile } from '@libs/filesharing/types/uploadFile';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import FileProgress from '@libs/filesharing/types/fileProgress';
import UploadResult from '@libs/filesharing/types/uploadResult';
import UploadFileParams from '@libs/filesharing/types/uploadFileParams';
import buildOctetStreamUrl from '@libs/filesharing/utils/buildOctetStreamUrl';
import createProgressHandler from '@libs/filesharing/utils/createProgressHandler';
import uploadOctetStream from '@libs/filesharing/utils/uploadOctetStream';
import eduApi from '@/api/eduApi';

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
  filesToUpload: [],
  isUploading: false,
  lastError: undefined,
  progressByName: {},
};

export const useHandelUploadFileStore = create<HandelUploadFileStore>((set, get) => ({
  ...initialState,

  uploadFiles: async ({ endpoint, destinationPath, parallel = true }) => {
    const files = get().filesToUpload;
    if (!files || files.length === 0) return [];

    set({ isUploading: true, lastError: undefined });

    const sanitizedDestinationPath = getPathWithoutWebdav(destinationPath);

    const setProgressForFile = (fileName: string, next: FileProgress) =>
      set((state) => ({
        progressByName: { ...state.progressByName, [fileName]: next },
      }));

    const uploadOne =
      (api: AxiosInstance) =>
      async (fileItem: UploadFile): Promise<UploadResult> => {
        const fileName = fileItem.name;
        const url = buildOctetStreamUrl(endpoint, sanitizedDestinationPath, fileItem);

        const progress = createProgressHandler({
          fileName,
          fileSize: fileItem.size,
          setProgress: (fp) => setProgressForFile(fileName, fp),
        });

        try {
          progress.markStart();
          await uploadOctetStream(api, url, fileItem, (e: AxiosProgressEvent) => progress.onUploadProgress(e));
          progress.markDone();
          return { name: fileName, ok: true };
        } catch (error) {
          progress.markError();
          return { name: fileName, ok: false, error: error instanceof Error ? error.message : 'upload_failed' };
        }
      };

    try {
      const runUpload = uploadOne(eduApi);

      let outcomes: UploadResult[];

      if (parallel) {
        const uploadPromises = files.map((fileItem) => runUpload(fileItem));
        const settledUploadResults = await Promise.allSettled(uploadPromises);

        outcomes = settledUploadResults.map((settledResult, fileIndex) => {
          if (settledResult.status === 'fulfilled') {
            return settledResult.value;
          }
          return {
            name: files[fileIndex].name,
            ok: false,
            error: String(settledResult.reason),
          } as UploadResult;
        });
      } else {
        outcomes = await files.reduce<Promise<UploadResult[]>>(
          async (promiseForOutcomes, fileItem) => {
            const outcomesSoFar = await promiseForOutcomes;
            const outcomeForCurrentFile = await runUpload(fileItem);
            return [...outcomesSoFar, outcomeForCurrentFile];
          },
          Promise.resolve([] as UploadResult[]),
        );
      }

      const firstFailureMessage = outcomes.find((r) => !r.ok)?.error;
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
