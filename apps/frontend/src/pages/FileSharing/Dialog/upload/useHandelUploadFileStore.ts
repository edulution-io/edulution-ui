/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

import { UploadFile } from '@libs/filesharing/types/uploadFile';
import FileProgress from '@libs/filesharing/types/fileProgress';
import UploadResult from '@libs/filesharing/types/uploadResult';
import createFileUploader from '@libs/filesharing/utils/createFileUploader';
import createUploadClient from '@libs/filesharing/utils/createUploadClient';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';

interface HandelUploadFileStore {
  isUploadDialogOpen: boolean;
  filesToUpload: UploadFile[];
  isUploading: boolean;
  lastError?: string;
  progressById: Record<string, { share: string | undefined; fileName: string; progress: FileProgress }>;
  uploadingById: Map<string, boolean>;
  setIsUploadDialogOpen: (isOpen: boolean) => void;
  closeUploadDialog: () => void;
  setFilesToUpload: (files: UploadFile[]) => void;
  updateFilesToUpload: (updater: (files: UploadFile[]) => UploadFile[]) => void;
  markUploading: (fileId: string, uploading: boolean) => void;
  uploadFiles: (
    currentPath: string,
    accessToken: string,
    share: string | undefined,
    parallel?: boolean,
  ) => Promise<UploadResult[]>;
  reset: () => void;
}

const initialState = {
  isUploadDialogOpen: false,
  filesToUpload: [],
  isUploading: false,
  lastError: undefined,
  progressById: {},
  uploadingById: new Map<string, boolean>(),
};

const useHandelUploadFileStore = create<HandelUploadFileStore>((set, get) => ({
  ...initialState,

  setIsUploadDialogOpen: (isOpen) => set({ isUploadDialogOpen: isOpen }),
  closeUploadDialog: () => set({ isUploadDialogOpen: false }),

  setFilesToUpload: (files) =>
    set((state) => ({
      filesToUpload: [
        ...state.filesToUpload,
        ...files.map((file) => ({
          ...file,
          id: file.id ?? uuid(),
        })),
      ],
    })),

  updateFilesToUpload: (updater) => set((state) => ({ filesToUpload: updater(state.filesToUpload) })),

  markUploading: (fileId: string, uploading: boolean): void => {
    set((state) => {
      const next = new Map(state.uploadingById);
      if (uploading) next.set(fileId, true);
      else next.delete(fileId);
      return {
        uploadingById: next,
        isUploading: next.size > 0,
      };
    });
  },

  uploadFiles: async (
    currentPath: string,
    accessToken: string,
    webdavShare: string | undefined,
    parallel: boolean = true,
  ): Promise<UploadResult[]> => {
    const files = get().filesToUpload;
    if (!files || files.length === 0) return [];

    set({ lastError: undefined });

    const setProgressForFile = (fileId: string, fileName: string, share: string | undefined, next: FileProgress) =>
      set((state) => ({
        progressById: {
          ...state.progressById,
          [fileId]: { share, fileName, progress: next },
        },
      }));

    const uploadHttpClient = createUploadClient(`/${EDU_API_ROOT}`, { share: webdavShare }, accessToken);

    const uploader = createFileUploader({
      httpClient: uploadHttpClient,
      destinationPath: currentPath,
      onProgressUpdate: (fileItem, next) => setProgressForFile(fileItem.id, fileItem.name, webdavShare, next),
      onUploadingChange: (fileItem, uploading) => get().markUploading(fileItem.id, uploading),
    });

    let outcomes: UploadResult[];

    if (parallel) {
      const uploadPromises = files.map((fileItem) => uploader(fileItem));
      set({ filesToUpload: [] });
      const settledUploadResults = await Promise.allSettled(uploadPromises);

      const successfulIds = settledUploadResults.filter((r) => r.status === 'fulfilled').map((_r, i) => files[i].id);

      set((state) => ({
        filesToUpload: state.filesToUpload.filter((f) => !successfulIds.includes(f.id)),
      }));

      outcomes = settledUploadResults.map((result, index) =>
        result.status === 'fulfilled'
          ? result.value
          : {
              id: files[index].id,
              name: files[index].name,
              success: false,
              error: String(result.reason),
            },
      );
    } else {
      outcomes = await files.reduce<Promise<UploadResult[]>>(async (accPromise, fileItem) => {
        const acc = await accPromise;
        const outcome = await uploader(fileItem);
        return [...acc, outcome];
      }, Promise.resolve([]));
    }

    return outcomes;
  },

  reset: () => set({ ...initialState }),
}));

export default useHandelUploadFileStore;
