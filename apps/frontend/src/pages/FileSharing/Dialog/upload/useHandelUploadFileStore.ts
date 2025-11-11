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
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import ContentType from '@libs/filesharing/types/contentType';
import eduApi from '@/api/eduApi';
import extractAllDirectories from '@libs/filesharing/utils/extractAllDirectories';
import { toast } from 'sonner';
import { t } from 'i18next';

interface HandelUploadFileStore {
  isUploadDialogOpen: boolean;
  filesToUpload: UploadFile[];
  isUploading: boolean;
  lastError?: string;
  totalFilesCount: number;
  totalBytesCount: number;
  progressById: Record<string, { share: string | undefined; fileName: string; progress: FileProgress }>;
  uploadingById: Map<string, boolean>;
  setIsUploadDialogOpen: (isOpen: boolean) => void;
  closeUploadDialog: () => void;
  setFilesToUpload: (files: UploadFile[]) => void;
  updateFilesToUpload: (updater: (files: UploadFile[]) => UploadFile[]) => void;
  markUploading: (fileId: string, uploading: boolean) => void;
  setDirectoryCreationProgress: (current: number, total: number, share: string | undefined) => void;
  uploadFiles: (currentPath: string, accessToken: string, share: string | undefined) => Promise<UploadResult[]>;
  clearProgress: () => void;
  reset: () => void;
}

const initialState = {
  totalFilesCount: 0,
  totalBytesCount: 0,
  isUploadDialogOpen: false,
  filesToUpload: [],
  isUploading: false,
  lastError: undefined,
  progressById: {},
  uploadingById: new Map<string, boolean>(),
};

const calculateTotalFilesAndBytes = (files: UploadFile[]): { filesCount: number; bytesCount: number } => {
  let filesCount = 0;
  let bytesCount = 0;

  files.forEach((file) => {
    if (file.isFolder && file.files) {
      filesCount += file.files.length;
      file.files.forEach((innerFile) => {
        bytesCount += innerFile.size;
      });
    } else {
      filesCount += 1;
      bytesCount += file.size;
    }
  });

  return { filesCount, bytesCount };
};

const createDirectory = async (path: string, webdavShare: string | undefined): Promise<void> => {
  try {
    const pathParts = path.split('/').filter((part) => part);
    const directoryName = pathParts[pathParts.length - 1];
    const parentPath = pathParts.slice(0, -1).join('/');
    const parentPathWithSlash = `/${parentPath}/`;

    await eduApi.post(
      FileSharingApiEndpoints.FILESHARING_ACTIONS,
      {
        path: parentPathWithSlash,
        newPath: directoryName,
      },
      {
        params: {
          share: webdavShare,
          type: ContentType.DIRECTORY,
          path: parentPathWithSlash,
        },
      },
    );
  } catch (error) {
    toast.error(t('filesharing.filesharingUpload.errors.directoryCreationFailed'));
  }
};

const uploadFolderWithFiles = async (
  folder: UploadFile,
  basePath: string,
  webdavShare: string | undefined,
  uploadFile: (file: File, uploadPath: string) => Promise<void>,
  setDirectoryProgress: (current: number, total: number, share: string | undefined) => void,
): Promise<void> => {
  if (!folder.isFolder || !folder.files) {
    return;
  }

  const directories = extractAllDirectories(folder, basePath);

  let createdCount = 0;

  await directories.reduce(async (previousPromise, directory) => {
    await previousPromise;
    try {
      setDirectoryProgress(createdCount, directories.length, webdavShare);
      await createDirectory(directory, webdavShare);
      createdCount += 1;
    } catch (error) {
      toast.error(t('filesharing.filesharingUpload.errors.directoryCreationFailed'));
    }
  }, Promise.resolve());

  setDirectoryProgress(directories.length, directories.length, webdavShare);

  await folder.files.reduce(async (previousPromise, file) => {
    await previousPromise;

    const relativePath = file.webkitRelativePath || file.name;
    const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    const uploadPath = `${cleanBasePath}/${relativePath}`;

    try {
      await uploadFile(file, uploadPath);
    } catch (error) {
      toast.error(t('filesharing.filesharingUpload.errors.fileUploadFailed'));
    }
  }, Promise.resolve());
};

const useHandelUploadFileStore = create<HandelUploadFileStore>((set, get) => ({
  ...initialState,

  setIsUploadDialogOpen: (isOpen) => set({ isUploadDialogOpen: isOpen }),

  closeUploadDialog: () => set({ isUploadDialogOpen: false }),

  setFilesToUpload: (files) => {
    const filesWithIds = files.map((file) => ({
      ...file,
      id: file.id ?? uuid(),
    }));

    const allFiles = [...get().filesToUpload, ...filesWithIds];
    const { filesCount, bytesCount } = calculateTotalFilesAndBytes(allFiles);

    set({
      filesToUpload: allFiles,
      totalFilesCount: filesCount,
      totalBytesCount: bytesCount,
    });
  },

  updateFilesToUpload: (updater) => set((state) => ({ filesToUpload: updater(state.filesToUpload) })),

  markUploading: (fileId: string, uploading: boolean): void => {
    set((state) => {
      const nextUploadingById = new Map(state.uploadingById);
      if (uploading) {
        nextUploadingById.set(fileId, true);
      } else {
        nextUploadingById.delete(fileId);
      }
      return {
        uploadingById: nextUploadingById,
        isUploading: nextUploadingById.size > 0,
      };
    });
  },

  setDirectoryCreationProgress: (current: number, total: number, share: string | undefined) => {
    const progressId = 'directory-creation';
    if (current >= total) {
      set((state) => {
        const newProgressById = { ...state.progressById };
        delete newProgressById[progressId];
        return { progressById: newProgressById };
      });
    } else {
      const progress: FileProgress = {
        status: 'uploading' as const,
        percent: Math.round((current / total) * 100),
        loaded: current,
        total,
        percentageComplete: Math.round((current / total) * 100),
        loadedByteCount: current,
        totalByteCount: total,
      };

      set((state) => ({
        progressById: {
          ...state.progressById,
          [progressId]: {
            share,
            fileName: t('filesharing.filesharingUpload.creatingDirectoryStructure'),
            progress,
          },
        },
      }));
    }
  },

  uploadFiles: async (
    currentPath: string,
    accessToken: string,
    webdavShare: string | undefined,
  ): Promise<UploadResult[]> => {
    const files = get().filesToUpload;

    if (!files || files.length === 0) {
      return [];
    }

    const { filesCount, bytesCount } = calculateTotalFilesAndBytes(files);

    set({
      lastError: undefined,
      filesToUpload: [],
      totalFilesCount: filesCount,
      totalBytesCount: bytesCount,
    });

    const uploadHttpClient = createUploadClient(`/${EDU_API_ROOT}`, { share: webdavShare }, accessToken);

    const setProgressForFile = (fileId: string, fileName: string, share: string | undefined, progress: FileProgress) =>
      set((state) => ({
        progressById: {
          ...state.progressById,
          [fileId]: { share, fileName, progress },
        },
      }));

    const singleFileUploader = createFileUploader({
      httpClient: uploadHttpClient,
      destinationPath: currentPath,
      onProgressUpdate: (fileItem, progress) => setProgressForFile(fileItem.id, fileItem.name, webdavShare, progress),
      onUploadingChange: (fileItem, uploading) => get().markUploading(fileItem.id, uploading),
    });

    const outcomes: UploadResult[] = [];
    let processedItems = 0;

    await files.reduce(async (previousPromise, fileItem) => {
      await previousPromise;

      processedItems += 1;

      try {
        if ('isFolder' in fileItem && fileItem.isFolder && fileItem.files) {
          const uploadFileCallback = async (file: File, uploadPath: string) => {
            const tempUploadFile: UploadFile = Object.assign(file, {
              id: `${fileItem.id}-${uploadPath}`,
              uploadPath,
            });
            await singleFileUploader(tempUploadFile);
          };

          await uploadFolderWithFiles(
            fileItem,
            currentPath,
            webdavShare,
            uploadFileCallback,
            get().setDirectoryCreationProgress,
          );

          outcomes.push({
            name: fileItem.folderName || fileItem.name,
            success: true,
          });
        } else {
          const result = await singleFileUploader(fileItem);

          outcomes.push(result);
        }
      } catch (error) {
        console.error(`❌ [${processedItems}/${files.length}] Failed: ${fileItem.name}`, error);
        outcomes.push({
          name: fileItem.name,
          success: false,
        });
      }
    }, Promise.resolve());

    return outcomes;
  },

  clearProgress: () => {
    set({
      progressById: {},
      totalFilesCount: 0,
      totalBytesCount: 0,
    });
  },

  reset: () => set({ ...initialState }),
}));

export default useHandelUploadFileStore;
