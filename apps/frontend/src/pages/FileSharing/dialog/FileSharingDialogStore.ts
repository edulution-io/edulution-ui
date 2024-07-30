import { AxiosError } from 'axios';
import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import React from 'react';
import handleApiError from '@/utils/handleApiError';
import { t } from 'i18next';
import { clearPathFromWebdav } from '@/pages/FileSharing/utilities/filesharingUtilities';
import { HttpMethodes } from '@libs/common/types/http-methods';
import FileActionType from '@libs/filesharing/types/fileActionType';
import { DirectoryFile } from '@libs/filesharing/types/filesystem';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/types/availableFileTypes';
import { FileTypeKey } from '@libs/filesharing/types/fileTypeKey';
import { WebDavActionResult } from '@libs/filesharing/types/fileActionStatus';

interface FileSharingDialogStore {
  isDialogOpen: boolean;
  openDialog: (action: FileActionType) => void;
  closeDialog: () => void;
  isLoading: boolean;
  userInput: string;
  filesToUpload: File[];
  moveItemsToPath: DirectoryFile;
  selectedFileType: (typeof AVAILABLE_FILE_TYPES)[FileTypeKey];
  setMoveItemsToPath: (item: DirectoryFile) => void;
  setUserInput: (userInput: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  fileOperationStatus: boolean | undefined;

  setError: (error: AxiosError) => void;
  reset: () => void;
  setSelectedFileType: (fileType: (typeof AVAILABLE_FILE_TYPES)[FileTypeKey]) => void;
  handleItemAction: (
    action: FileActionType,
    endpoint: string,
    httpMethod: HttpMethodes,
    data: Record<string, string> | Record<string, string>[] | FormData,
  ) => Promise<void>;
  setFilesToUpload: React.Dispatch<React.SetStateAction<File[]>>;
  action: FileActionType;
  setAction: (action: FileActionType) => void;
  fileOperationResult: WebDavActionResult | undefined;
  setFileOperationResult: (fileOperationSuccessful: boolean, message: string, status: number) => void;
}

const initialState: Partial<FileSharingDialogStore> = {
  isDialogOpen: false,
  isLoading: false,
  error: null,
  userInput: '',
  moveItemsToPath: {} as DirectoryFile,
  selectedFileType: {} as (typeof AVAILABLE_FILE_TYPES)[FileTypeKey],
  filesToUpload: [],
};

const handleDeleteItems = async (data: Record<string, string>[], endpoint: string, httpMethod: HttpMethodes) => {
  const promises = data
    .map((item) => clearPathFromWebdav(item.path))
    .filter((filename) => filename !== undefined)
    .map((filename) => eduApi[httpMethod](`${endpoint}/${filename}`));

  return Promise.all(promises);
};

const handleArrayActions = async (data: Record<string, string>[], endpoint: string, httpMethod: HttpMethodes) => {
  const promises = data.map((item) => eduApi[httpMethod](endpoint, item));
  return Promise.all(promises);
};

const useFileSharingDialogStore = create<FileSharingDialogStore>((set, get) => ({
  ...(initialState as FileSharingDialogStore),
  openDialog: (action: FileActionType) =>
    set(() => ({
      isDialogOpen: true,
      action,
    })),
  closeDialog: () => set({ isDialogOpen: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),
  setUserInput: (userInput) => set({ userInput }),
  setFilesToUpload: (files) => set({ filesToUpload: typeof files === 'function' ? files(get().filesToUpload) : files }),
  setMoveItemsToPath: (path) => set({ moveItemsToPath: path }),
  setSelectedFileType: (fileType) => set({ selectedFileType: fileType }),
  setFileOperationResult: (success, message = t('unknownErrorOccurred'), status = 500) => {
    const result: WebDavActionResult = { success, message, status };
    set({ fileOperationResult: result });

    setTimeout(() => {
      set({ fileOperationResult: undefined });
    }, 4000);
  },
  setFileOperationStatus: (status: boolean | undefined) => {
    set({ fileOperationStatus: status });
  },

  handleItemAction: async (action, endpoint, httpMethod, data) => {
    set({ isLoading: true });
    try {
      if (Array.isArray(data)) {
        if (httpMethod === HttpMethodes.DELETE) {
          await handleDeleteItems(data, endpoint, httpMethod);
          get().setFileOperationResult(true, t('response.files_deleted_successfully'), 200);
        } else if (action === FileActionType.MOVE || action === FileActionType.UPLOAD_FILE) {
          await handleArrayActions(data, endpoint, httpMethod);
          get().setFileOperationResult(true, t('fileOperationSuccessful'), 200);
        }
      } else {
        await eduApi[httpMethod](endpoint, data as Record<string, string>);
        get().setFileOperationResult(true, t('fileOperationSuccessful'), 200);
      }
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false, isDialogOpen: false, error: null });
    }
  },
}));

export default useFileSharingDialogStore;
