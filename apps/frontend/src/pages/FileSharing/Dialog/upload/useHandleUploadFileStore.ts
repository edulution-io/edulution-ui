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
import { UploadItem } from '@libs/filesharing/types/uploadItem';
import FileProgress from '@libs/filesharing/types/fileProgress';
import UploadResult from '@libs/filesharing/types/uploadResult';
import createFileUploader from '@libs/filesharing/utils/createFileUploader';
import createUploadClient from '@libs/filesharing/utils/createUploadClient';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import ContentType from '@libs/filesharing/types/contentType';
import extractAllDirectories from '@libs/filesharing/utils/extractAllDirectories';
import { toast } from 'sonner';
import { t } from 'i18next';
import calculateTotalFilesAndBytes from '@libs/filesharing/utils/calculateTotalFilesAndBytes';
import { HttpMethods } from '@libs/common/types/http-methods';
import handleSingleData from '@/pages/FileSharing/Dialog/handleFileAction/handleSingleData';
import FileActionType from '@libs/filesharing/types/fileActionType';

interface HandleUploadFileStore {
  isUploadDialogOpen: boolean;
  filesToUpload: UploadItem[];
  isUploading: boolean;
  totalFilesCount: number;
  totalBytesCount: number;
  progressById: Record<string, { share: string | undefined; fileName: string; progress: FileProgress }>;
  uploadingById: Map<string, boolean>;
  setIsUploadDialogOpen: (isOpen: boolean) => void;
  closeUploadDialog: () => void;
  setFilesToUpload: (files: UploadItem[]) => void;
  updateFilesToUpload: (updater: (files: UploadItem[]) => UploadItem[]) => void;
  markUploading: (fileId: string, uploading: boolean) => void;
  setDirectoryCreationProgress: (current: number, total: number, share: string | undefined) => void;
  uploadFiles: (currentPath: string, accessToken: string, share: string | undefined) => Promise<UploadResult[]>;
  clearProgress: () => void;
  reset: () => void;
}

const DIRECTORY_CREATION_PROGRESS_ID = 'directory-creation';

const createInitialState = () => ({
  totalFilesCount: 0,
  totalBytesCount: 0,
  isUploadDialogOpen: false,
  filesToUpload: [],
  isUploading: false,
  progressById: {},
  uploadingById: new Map<string, boolean>(),
});

const createProgressFromCounts = (current: number, total: number): FileProgress => {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);

  return {
    status: 'uploading',
    percent,
    loaded: current,
    total,
    percentageComplete: percent,
    loadedByteCount: current,
    totalByteCount: total,
  };
};

const isFolderUpload = (fileItem: UploadItem): fileItem is UploadItem & { isFolder: true; files: File[] } =>
  'isFolder' in fileItem && fileItem.isFolder === true && Array.isArray(fileItem.files);

const createSingleDirectory = async (directoryPath: string, webdavShare: string | undefined): Promise<void> => {
  const pathParts = directoryPath.split('/').filter((part) => part);
  const directoryName = pathParts[pathParts.length - 1];
  const parentPath = pathParts.slice(0, -1).join('/');
  const parentPathWithSlash = `/${parentPath}/`;

  await handleSingleData(
    FileActionType.CREATE_FOLDER,
    FileSharingApiEndpoints.FILESHARING_ACTIONS,
    HttpMethods.POST,
    ContentType.DIRECTORY,
    {
      path: parentPathWithSlash,
      newPath: directoryName,
    },
    webdavShare,
  );
};

const createDirectoryStructure = async (
  directories: string[],
  webdavShare: string | undefined,
  setDirectoryProgress: (current: number, total: number, share: string | undefined) => void,
): Promise<void> => {
  let createdCount = 0;

  await directories.reduce(async (previousPromise, directoryPath) => {
    await previousPromise;

    setDirectoryProgress(createdCount, directories.length, webdavShare);

    try {
      await createSingleDirectory(directoryPath, webdavShare);
      createdCount += 1;
    } catch (error) {
      toast.error(t('filesharing.filesharingUpload.errors.directoryCreationFailed'));
    }
  }, Promise.resolve());

  setDirectoryProgress(directories.length, directories.length, webdavShare);
};

const uploadFolderFiles = async (
  files: File[],
  basePath: string,
  uploadFile: (file: File, uploadPath: string) => Promise<void>,
): Promise<void> => {
  await files.reduce(async (previousPromise, file) => {
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

const uploadFolder = async (
  folder: UploadItem,
  basePath: string,
  webdavShare: string | undefined,
  uploadFile: (file: File, uploadPath: string) => Promise<void>,
  setDirectoryProgress: (current: number, total: number, share: string | undefined) => void,
): Promise<void> => {
  if (!isFolderUpload(folder)) {
    return;
  }

  const directories = extractAllDirectories(folder, basePath);

  await createDirectoryStructure(directories, webdavShare, setDirectoryProgress);
  await uploadFolderFiles(folder.files, basePath, uploadFile);
};

type FileUploader = (fileItem: UploadItem) => Promise<UploadResult>;

const processSingleUploadItem = async (
  fileItem: UploadItem,
  currentPath: string,
  webdavShare: string | undefined,
  singleFileUploader: FileUploader,
  setDirectoryProgress: (current: number, total: number, share: string | undefined) => void,
): Promise<UploadResult> => {
  try {
    if (isFolderUpload(fileItem)) {
      const uploadFileCallback = async (file: File, uploadPath: string) => {
        const tempUploadFile: UploadItem = Object.assign(file, {
          id: `${fileItem.id}-${uploadPath}`,
          uploadPath,
        });
        await singleFileUploader(tempUploadFile);
      };

      await uploadFolder(fileItem, currentPath, webdavShare, uploadFileCallback, setDirectoryProgress);

      return {
        name: fileItem.folderName || fileItem.name,
        success: true,
      };
    }
    return await singleFileUploader(fileItem);
  } catch (error) {
    return {
      name: fileItem.name,
      success: false,
    };
  }
};

const useHandleUploadFileStore = create<HandleUploadFileStore>((set, get) => ({
  ...createInitialState(),

  setIsUploadDialogOpen: (isOpen) => {
    if (isOpen) {
      set({
        isUploadDialogOpen: true,
        filesToUpload: [],
        totalFilesCount: 0,
        totalBytesCount: 0,
        progressById: {},
      });
    } else {
      set({ isUploadDialogOpen: false });
    }
  },

  closeUploadDialog: () => set({ isUploadDialogOpen: false }),

  setFilesToUpload: (files) => {
    const filesWithIds = files.map((file) => ({
      ...file,
      id: file.id ?? crypto.randomUUID(),
    }));

    const allFiles = [...get().filesToUpload, ...filesWithIds];
    const { filesCount, bytesCount } = calculateTotalFilesAndBytes(allFiles);

    set({
      filesToUpload: allFiles,
      totalFilesCount: filesCount,
      totalBytesCount: bytesCount,
    });
  },

  updateFilesToUpload: (updater) =>
    set((state) => {
      const newFiles = updater(state.filesToUpload);
      const { filesCount, bytesCount } = calculateTotalFilesAndBytes(newFiles);

      return {
        filesToUpload: newFiles,
        totalFilesCount: filesCount,
        totalBytesCount: bytesCount,
      };
    }),

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
    if (current >= total) {
      set((state) => {
        const newProgressById = { ...state.progressById };
        delete newProgressById[DIRECTORY_CREATION_PROGRESS_ID];
        return { progressById: newProgressById };
      });
    } else {
      const progress = createProgressFromCounts(current, total);

      set((state) => ({
        progressById: {
          ...state.progressById,
          [DIRECTORY_CREATION_PROGRESS_ID]: {
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
      filesToUpload: [],
      totalFilesCount: filesCount,
      totalBytesCount: bytesCount,
      progressById: {},
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

    await files.reduce(async (previousPromise, fileItem) => {
      await previousPromise;

      const result = await processSingleUploadItem(
        fileItem,
        currentPath,
        webdavShare,
        singleFileUploader,
        get().setDirectoryCreationProgress,
      );

      outcomes.push(result);
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

  reset: () => set(createInitialState()),
}));

export default useHandleUploadFileStore;
