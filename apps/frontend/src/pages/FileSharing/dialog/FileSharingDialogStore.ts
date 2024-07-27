import { AxiosError } from 'axios';
import { create } from 'zustand';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import React from 'react';
import handleApiError from '@/utils/handleApiError';
import { WebDavActionResult } from '@libs/filesharing/types/fileActionStatus';
import { t } from 'i18next';
import { HttpMethodes } from '@libs/common/types/http-methods';
import FileActionType from '@libs/filesharing/types/fileActionType';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/types/availableFileTypes';
import { FileTypeKey } from '@libs/filesharing/types/fileTypeKey';
import ContentType from '@libs/filesharing/types/contentType';
import handleFileOrCreateFile from '@/pages/FileSharing/dialog/handleFileAction/handleFileOrCreateFile';
import handleArrayData from '@/pages/FileSharing/dialog/handleFileAction/handleArrayData';
import handleSingleData from '@/pages/FileSharing/dialog/handleFileAction/handleSingleData';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';
import DeleteFileProps from '@libs/filesharing/types/deleteFileProps';
import FileUploadProps from '@libs/filesharing/types/fileUploadProps';

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
    data: PathChangeOrCreateProps | PathChangeOrCreateProps[] | FileUploadProps[] | DeleteFileProps[] | FormData,
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

  handleItemAction: async (
    action: FileActionType,
    endpoint: string,
    httpMethod: HttpMethodes,
    type: ContentType,
    data: PathChangeOrCreateProps | PathChangeOrCreateProps[] | FileUploadProps[] | DeleteFileProps[] | FormData,
  ) => {
    set({ isLoading: true });

    try {
      if (data instanceof FormData) {
        await handleFileOrCreateFile(action, endpoint, httpMethod, type, data);
        get().setFileOperationResult(true, t('fileOperationSuccessful'), 200);
      } else if (Array.isArray(data)) {
        await handleArrayData(action, endpoint, httpMethod, data as PathChangeOrCreateProps[]);
        get().setFileOperationResult(true, t('fileOperationSuccessful'), 200);
      } else {
        await handleSingleData(action, endpoint, httpMethod, type, data);
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
