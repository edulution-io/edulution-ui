import { AxiosError } from 'axios';
import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import { DirectoryFileDTO } from '@libs/filesharing/DirectoryFileDTO';
import React from 'react';

import handleApiError from '@/utils/handleApiError';
import { WebDavActionResult } from '@libs/filesharing/FileActionStatus';
import { t } from 'i18next';
import { HttpMethodes } from '@libs/common/types/http-methods';
import FileActionType from '@libs/filesharing/types/fileActionType';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/types/availableFileTypes';
import { FileTypeKey } from '@libs/filesharing/types/fileTypeKey';
import ContentType from '@libs/filesharing/ContentType';
import buildApiFilePathUrl from '@libs/filesharing/utils/buildApiFilePathUrl';
import buildApiFileTypePathUrl from '@libs/filesharing/utils/buildApiFileTypePathUrl';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';

interface FileSharingDialogStore {
  isDialogOpen: boolean;
  openDialog: (action: FileActionType) => void;
  closeDialog: () => void;
  isLoading: boolean;
  userInput: string;
  filesToUpload: File[];
  moveItemsToPath: DirectoryFileDTO;
  selectedFileType: (typeof AVAILABLE_FILE_TYPES)[FileTypeKey];
  setMoveItemsToPath: (item: DirectoryFileDTO) => void;
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
    type: ContentType,
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
  moveItemsToPath: {} as DirectoryFileDTO,
  selectedFileType: {} as (typeof AVAILABLE_FILE_TYPES)[FileTypeKey],
  filesToUpload: [],
};

const handleDeleteItems = async (data: Record<string, string>[], endpoint: string, httpMethod: HttpMethodes) => {
  const promises = data
    .map((item) => getPathWithoutWebdav(item.path))
    .filter((filename) => filename !== undefined)
    .map((filename) => eduApi[httpMethod](`${buildApiFilePathUrl(endpoint, filename)}`));

  return Promise.all(promises);
};

const handleArrayActions = async (data: Record<string, string>[], endpoint: string, httpMethod: HttpMethodes) => {
  const promises = data.map((item) => eduApi[httpMethod](buildApiFilePathUrl(endpoint, item.path), item));
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

  handleItemAction: async (action, endpoint, httpMethod, type, data) => {
    set({ isLoading: true });
    try {
      if (action === FileActionType.DELETE_FILE_FOLDER) {
        if (Array.isArray(data)) {
          await handleDeleteItems(data, endpoint, httpMethod);
          get().setFileOperationResult(true, t('response.files_deleted_successfully'), 200);
        }
      }
      if (action === FileActionType.CREATE_FOLDER) {
        const a = data as { path: string; name: string };
        await eduApi[httpMethod](buildApiFileTypePathUrl(endpoint, type, a.path), a);
        get().setFileOperationResult(true, t('response.fileOperationSuccessful'), 200);
      }

      if (action === FileActionType.RENAME_FILE_FOLDER) {
        const a = data as { path: string; newPath: string };
        await eduApi[httpMethod](buildApiFilePathUrl(endpoint, a.path), a);
        get().setFileOperationResult(true, t('response.fileOperationSuccessful'), 200);
      }

      if (action === FileActionType.MOVE_FILE_FOLDER) {
        if (Array.isArray(data)) {
          await handleArrayActions(data, endpoint, httpMethod);
          get().setFileOperationResult(true, t('response.files_deleted_successfully'), 200);
        }
      }

      if (action === FileActionType.UPLOAD_FILE || action === FileActionType.CREATE_FILE) {
        const formData = data as FormData;
        await eduApi[httpMethod](
          buildApiFileTypePathUrl(endpoint, type, getPathWithoutWebdav(formData.get('path') as string)),
          formData,
        );
        get().setFileOperationResult(true, t('response.fileOperationSuccessful'), 200);
      }
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false, isDialogOpen: false, error: null });
    }
  },
}));

export default useFileSharingDialogStore;
