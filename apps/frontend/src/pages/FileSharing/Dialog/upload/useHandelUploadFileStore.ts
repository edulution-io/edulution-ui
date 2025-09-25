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

import { UploadFile } from '@libs/filesharing/types/uploadFile';
import FileProgress from '@libs/filesharing/types/fileProgress';
import UploadResult from '@libs/filesharing/types/uploadResult';
import createFileUploader from '@libs/filesharing/utils/createFileUploader';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import createUploadClient from '@libs/filesharing/utils/createUploadClient';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';

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
  uploadFiles: (currentPath: string, accessToken: string, parallel?: boolean) => Promise<UploadResult[]>;
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

const useHandelUploadFileStore = create<HandelUploadFileStore>((set, get) => ({
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

  uploadFiles: async (currentPath: string, accessToken: string, parallel: boolean = true): Promise<UploadResult[]> => {
    const files = get().filesToUpload;
    if (!files || files.length === 0) return [];

    set({ lastError: undefined });

    const sanitizedDestinationPath = getPathWithoutWebdav(currentPath);

    const setProgressForFile = (fileName: string, next: FileProgress) =>
      set((state) => ({ progressByName: { ...state.progressByName, [fileName]: next } }));

    const uploadHttp = createUploadClient(`/${EDU_API_ROOT}`, accessToken);

    const uploader = createFileUploader({
      httpClient: uploadHttp,
      destinationPath: sanitizedDestinationPath,
      onProgressUpdate: setProgressForFile,
      onUploadingChange: (fileName, uploading) => get().markUploading(fileName, uploading),
    });

    let outcomes: UploadResult[];

    if (parallel) {
      const uploadPromises = files.map((fileItem) => uploader(fileItem));
      set({ filesToUpload: [] });
      const settledUploadResults = await Promise.allSettled(uploadPromises);

      outcomes = settledUploadResults.map((settledResult, fileIndex) => {
        if (settledResult.status === 'fulfilled') {
          return settledResult.value;
        }
        return {
          name: files[fileIndex].name,
          success: false,
          error: String(settledResult.reason),
        } as UploadResult;
      });
    } else {
      outcomes = await files.reduce<Promise<UploadResult[]>>(
        async (promiseForOutcomes, fileItem) => {
          const outcomesSoFar = await promiseForOutcomes;
          const outcomeForCurrentFile = await uploader(fileItem);
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
