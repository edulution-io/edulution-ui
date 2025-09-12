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
import buildOctetStreamUrl from '@libs/filesharing/utils/buildOctetStreamUrl';
import createProgressHandler from '@libs/filesharing/utils/createProgressHandler';
import uploadOctetStream from '@libs/filesharing/utils/uploadOctetStream';
import eduApi from '@/api/eduApi';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';

interface HandelUploadFileStore {
  isUploadDialogOpen: boolean;
  filesToUpload: UploadFile[];
  isUploading: boolean;
  lastError?: string;
  progressByName: Record<string, FileProgress>;
  uploadingByName: Map<string, boolean>;
  setIsUploadDialogOpen: (isOpen: boolean) => void;
  closeUploadDialog: () => void;
  setFilesToUpload: (files: UploadFile[]) => void;
  updateFilesToUpload: (updater: (files: UploadFile[]) => UploadFile[]) => void;
  markUploading: (fileName: string, uploading: boolean) => void;
  uploadFiles: (currentPath: string, parallel?: boolean) => Promise<UploadResult[]>;
  reset: () => void;
}

const initialState = {
  isUploadDialogOpen: false,
  filesToUpload: [],
  isUploading: false,
  lastError: undefined,
  progressByName: {},
  uploadingByName: new Map<string, boolean>(),
};

export const useHandelUploadFileStore = create<HandelUploadFileStore>((set, get) => ({
  ...initialState,

  setIsUploadDialogOpen: (isOpen) => set({ isUploadDialogOpen: isOpen }),
  closeUploadDialog: () => set({ isUploadDialogOpen: false }),
  setFilesToUpload: (files) => set({ filesToUpload: files }),
  updateFilesToUpload: (updater) => set((state) => ({ filesToUpload: updater(state.filesToUpload) })),

  markUploading: (fileName: string, uploading: boolean): void => {
    set((state) => {
      const next = new Map(state.uploadingByName);
      if (uploading) next.set(fileName, true);
      else next.delete(fileName);
      return {
        uploadingByName: next,
        isUploading: next.size > 0,
      };
    });
  },

  uploadFiles: async (currentPath: string, parallel: boolean = true): Promise<UploadResult[]> => {
    const files = get().filesToUpload;
    if (!files || files.length === 0) return [];

    set({ lastError: undefined });

    const sanitizedDestinationPath = getPathWithoutWebdav(currentPath);

    const setProgressForFile = (fileName: string, next: FileProgress) =>
      set((state) => ({
        progressByName: { ...state.progressByName, [fileName]: next },
      }));

    const makeUploader =
      (api: AxiosInstance) =>
      async (fileItem: UploadFile): Promise<UploadResult> => {
        const fileName = fileItem.name;
        const url = buildOctetStreamUrl(
          `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.UPLOAD}`,
          sanitizedDestinationPath,
          fileItem,
        );

        const progress = createProgressHandler({
          fileName,
          fileSize: fileItem.size,
          setProgress: (fp) => setProgressForFile(fileName, fp),
        });

        get().markUploading(fileName, true);
        try {
          progress.markStart();
          await uploadOctetStream(api, url, fileItem, (e: AxiosProgressEvent) => progress.onUploadProgress(e));
          progress.markDone();
          return { name: fileName, ok: true };
        } catch (error) {
          progress.markError();
          return {
            name: fileName,
            ok: false,
          };
        } finally {
          get().markUploading(fileName, false);
        }
      };

    const runUpload = makeUploader(eduApi);
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
    return outcomes;
  },

  reset: () =>
    set({
      ...initialState,
    }),
}));

export default useHandelUploadFileStore;
