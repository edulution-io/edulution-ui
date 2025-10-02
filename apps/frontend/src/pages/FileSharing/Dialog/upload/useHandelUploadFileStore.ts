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
import createUploadClient from '@libs/filesharing/utils/createUploadClient';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import UploadFolder from '@libs/filesharing/types/uploadFolder';
import { UploadItem } from '@libs/filesharing/types/uploadItem';
import UploadStatus from '@libs/filesharing/types/uploadStatus';
import isFileItem from '@libs/filesharing/utils/isFileItem';
import uniqueFileKey from '@libs/filesharing/utils/uniqueFileKey';
import countFilesInFolder from '@libs/filesharing/utils/countFilesInFolder';
import eduApi from '@/api/eduApi';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';

interface HandelUploadFileStore {
  isUploadDialogOpen: boolean;
  filesToUpload: UploadItem[];
  isUploading: boolean;
  lastError?: string;
  progressByName: Record<string, FileProgress>;
  uploadingByName: Map<string, boolean>;
  setIsUploadDialogOpen: (isOpen: boolean) => void;
  closeUploadDialog: () => void;
  setFilesToUpload: (files: UploadFile[]) => void;
  updateFilesToUpload: (updater: (files: UploadItem[]) => UploadItem[]) => void;
  markUploading: (fileKey: string, uploading: boolean) => void;
  folders: UploadFolder[];
  setFolders: (folders: UploadFolder[]) => void;
  addFolder: (folder: UploadFolder) => void;
  uploadFiles: (
    currentPath: string,
    accessToken: string,
    share: string | undefined,
    parallel?: boolean,
  ) => Promise<UploadResult[]>;
  uploadFolders: (
    currentPath: string,
    accessToken: string,
    share: string | undefined,
    parallel?: boolean,
  ) => Promise<UploadResult[]>;
  reset: () => void;
  totalPlanned: number;
  completedByName: Set<string>;
  getUploadingCount: () => number;
  getCompletedCount: () => number;
}

const initialState = {
  isUploadDialogOpen: false,
  filesToUpload: [],
  isUploading: false,
  lastError: undefined,
  isTldrDialogOpen: false,
  progressByName: {} as Record<string, FileProgress>,
  uploadingByName: new Map<string, boolean>(),
  folders: [] as UploadFolder[],
  totalPlanned: 0,
  completedByName: new Set<string>(),
};

const createFolder = async (folderName: string, basePath: string, share: string) => {
  const query = new URLSearchParams({ share: share ?? '', type: 'COLLECTION', path: basePath });
  const url = `${FileSharingApiEndpoints.FILESHARING_ACTIONS}?${query.toString()}`;
  const payload = { path: basePath, newPath: folderName };
  await eduApi.post(url, payload);
};

const useHandelUploadFileStore = create<HandelUploadFileStore>((set, get) => {
  const setProgress = (
    key: string,
    patch: Partial<FileProgress> & {
      loaded?: number;
      total?: number;
      percent?: number;
      bytesPerSecond?: number;
      estimatedSecondsRemaining?: number;
    },
  ) =>
    set((state) => ({
      progressByName: {
        ...state.progressByName,
        [key]: {
          ...(state.progressByName[key] ?? {}),
          ...patch,
          lastUpdateTimestampMs: Date.now(),
        } as FileProgress,
      },
    }));

  const markUploading = (fileKey: string, uploading: boolean) => {
    set((state) => {
      const nextUploadingMap = new Map(state.uploadingByName);
      const nextCompletedSet = new Set(state.completedByName);
      if (uploading) nextUploadingMap.set(fileKey, true);
      else {
        nextUploadingMap.delete(fileKey);
        nextCompletedSet.add(fileKey);
      }
      return {
        uploadingByName: nextUploadingMap,
        completedByName: nextCompletedSet,
        isUploading: nextUploadingMap.size > 0,
      };
    });
  };

  const makePerFileUploader = (key: string, destinationPath: string, accessToken: string, share: string | undefined) =>
    createFileUploader({
      httpClient: createUploadClient(`/${EDU_API_ROOT}`, { share }, accessToken),
      destinationPath,
      onProgressUpdate: (_name: string, progress: FileProgress) => {
        const total =
          progress.total ?? progress.totalByteCount ?? progress.totalByteCount ?? get().progressByName[key]?.total ?? 0;

        const loaded = progress.loaded ?? progress.loadedByteCount ?? progress.loadedByteCount ?? 0;

        let percent: number;
        if (typeof progress.percent === 'number') {
          percent = progress.percent;
        } else if (total > 0) {
          percent = Math.min(100, Math.round((loaded / total) * 100));
        } else {
          percent = get().progressByName[key]?.percent ?? 0;
        }

        const bytesPerSecondLocal = progress.bytesPerSecond ?? progress.speedBps;

        const estimatedSecondsRemainingLocal = progress.estimatedSecondsRemaining ?? progress.etaSeconds;

        setProgress(key, {
          status: UploadStatus.uploading,
          loaded,
          total,
          percent,
          bytesPerSecond: typeof bytesPerSecondLocal === 'number' ? bytesPerSecondLocal : undefined,
          estimatedSecondsRemaining:
            typeof estimatedSecondsRemainingLocal === 'number' ? estimatedSecondsRemainingLocal : undefined,
        });
      },
      onUploadingChange: () => {},
    });

  return {
    ...initialState,

    setIsUploadDialogOpen: (isOpen) => set({ isUploadDialogOpen: isOpen }),
    closeUploadDialog: () => set({ isUploadDialogOpen: false }),
    setFilesToUpload: (files) => set({ filesToUpload: files }),
    updateFilesToUpload: (updater) => set((state) => ({ filesToUpload: updater(state.filesToUpload) })),
    setFolders: (folders) => set({ folders }),
    addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),

    getUploadingCount: () => get().uploadingByName.size,
    getCompletedCount: () => get().completedByName.size,

    markUploading,

    uploadFiles: async (currentPath, accessToken, share, parallel = true) => {
      const items = get().filesToUpload;
      if (!items || items.length === 0) return [];
      const files = items.filter(isFileItem);

      const normalizedPath = currentPath.replace(/\/?$/, '/');

      set({
        lastError: undefined,
        totalPlanned: files.length,
        completedByName: new Set(),
        uploadingByName: new Map(),
      });

      const runUpload = async (file: UploadFile, index: number) => {
        const key = uniqueFileKey(`${normalizedPath}${file.name}`, index);
        setProgress(key, {
          status: UploadStatus.uploading,
          loaded: 0,
          total: file.size ?? 0,
          percent: 0,
        });
        markUploading(key, true);
        try {
          const uploader = makePerFileUploader(key, currentPath, accessToken, share);
          const result = await uploader(file);
          setProgress(key, {
            status: UploadStatus.done,
            loaded: file.size ?? get().progressByName[key]?.total ?? 0,
            total: get().progressByName[key]?.total ?? file.size ?? 0,
            percent: 100,
            bytesPerSecond: 0,
            estimatedSecondsRemaining: 0,
          });
          return result;
        } finally {
          markUploading(key, false);
        }
      };

      let outcomes: UploadResult[];

      if (parallel) {
        const tasks = files.map((file, index) => runUpload(file, index));
        set({ filesToUpload: [] });
        const settled = await Promise.allSettled(tasks);
        outcomes = settled.map((settledResult, index) =>
          settledResult.status === 'fulfilled'
            ? settledResult.value
            : ({ name: files[index].name, ok: false, error: String(settledResult.reason) } as UploadResult),
        );
      } else {
        outcomes = [] as UploadResult[];
        await files.reduce<Promise<void>>(async (prev, file, idx) => {
          await prev;
          const result = await runUpload(file, idx);
          outcomes[outcomes.length] = result;
        }, Promise.resolve());
      }

      return outcomes;
    },

    uploadFolders: async (currentPath, accessToken, share, _parallel = true) => {
      const { folders } = get();
      const normalizedPath = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;

      set({
        totalPlanned: (folders ?? []).reduce((accumulator, folder) => accumulator + countFilesInFolder(folder), 0),
        completedByName: new Set(),
        uploadingByName: new Map(),
      });

      const uploaderFactory = (destinationPath: string) => async (file: UploadFile) => {
        const key = `${destinationPath}${file.name}`;
        setProgress(key, {
          status: UploadStatus.uploading,
          loaded: 0,
          total: file.size ?? 0,
          percent: 0,
        });
        markUploading(key, true);
        try {
          const uploader = makePerFileUploader(key, destinationPath, accessToken, share);
          const result = await uploader(file);
          setProgress(key, {
            status: UploadStatus.done,
            loaded: file.size ?? get().progressByName[key]?.total ?? 0,
            total: get().progressByName[key]?.total ?? file.size ?? 0,
            percent: 100,
            bytesPerSecond: 0,
            estimatedSecondsRemaining: 0,
          });
          return result;
        } finally {
          markUploading(key, false);
        }
      };

      const processFolderRecursiveLocal = async (
        folder: UploadFolder,
        basePath: string,
        shareParam?: string,
      ): Promise<UploadResult[]> => {
        const folderPath = `${basePath}${folder.name}/`;
        await createFolder(folder.name, basePath, shareParam || '');
        const uploader = uploaderFactory(folderPath);
        const fileResults = await Promise.all(folder.files.map((file) => uploader(file)));
        const subfolderResultsNested = await Promise.all(
          folder.subfolders.map((subfolder) => processFolderRecursiveLocal(subfolder, folderPath, shareParam)),
        );
        return [...fileResults, ...subfolderResultsNested.flat()];
      };

      const resultsNested = await Promise.all(
        (folders ?? []).map((folder) => processFolderRecursiveLocal(folder, normalizedPath, share)),
      );

      return resultsNested.flat();
    },

    reset: () => set({ ...initialState }),
  };
});

export default useHandelUploadFileStore;
