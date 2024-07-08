import { AxiosError } from 'axios';
import { create } from 'zustand';
import ActionItems from '@/pages/FileSharing/dialog/ActionsType/ActionItems';
import eduApi from '@/api/eduApi';
import HttpMethod from '@/pages/FileSharing/dialog/HttpMethod';
import { WebDavActionResult } from '@/pages/FileSharing/dialog/ActionStatus';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import { AVAILABLE_FILE_TYPES, FileTypeKey } from '@/pages/FileSharing/fileoperations/fileCreationDropDownOptions';
import React from 'react';

interface FileSharingDialogStore {
  isDialogOpen: boolean;
  openDialog: (action: ActionItems) => void;
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
  setError: (error: AxiosError) => void;
  reset: () => void;
  setSelectedFileType: (fileType: (typeof AVAILABLE_FILE_TYPES)[FileTypeKey]) => void;
  handleItemAction: (
    action: ActionItems,
    endpoint: string,
    httpMethod: HttpMethod,
    data: Record<string, string> | Record<string, string>[] | FormData,
  ) => Promise<void>;
  setFilesToUpload: React.Dispatch<React.SetStateAction<File[]>>;
  action: ActionItems;
  setAction: (action: ActionItems) => void;
  fileOperationSuccessful: WebDavActionResult;
  setFileOperationSuccessful: (fileOperationSuccessful: boolean | undefined, message: string, status: number) => void;
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

const handleDeleteItems = async (data: Record<string, string>[], endpoint: string, httpMethod: HttpMethod) => {
  const promises = data
    .map((item) => item.path.replace('/webdav/', ''))
    .filter((filename) => filename !== undefined)
    .map((filename) => eduApi[httpMethod](`${endpoint}/${filename}`));

  return Promise.all(promises);
};

const handleArrayActions = async (data: Record<string, string>[], endpoint: string, httpMethod: HttpMethod) => {
  const promises = data.map((item) => eduApi[httpMethod](endpoint, item));
  return Promise.all(promises);
};

const useFileSharingDialogStore = create<FileSharingDialogStore>((set, get) => ({
  ...(initialState as FileSharingDialogStore),
  openDialog: (action: ActionItems) =>
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
  setFileOperationSuccessful: (fileOperationSuccessful: boolean | undefined, message: string, status: number) => {
    const safeOperation = fileOperationSuccessful || false;
    const safeMessage = message || 'Default message';
    const safeStatus = status || 500;
    const result: WebDavActionResult = safeOperation
      ? { success: safeOperation, message: safeMessage, status: safeStatus }
      : { success: safeOperation, message: safeMessage, status: safeStatus };
    set({ fileOperationSuccessful: result });
    if (fileOperationSuccessful !== undefined) {
      setTimeout(() => {
        set({ fileOperationSuccessful: undefined });
      }, 4000);
    }
  },

  handleItemAction: async (action, endpoint, httpMethod, data) => {
    set({ isLoading: true });
    try {
      if (Array.isArray(data)) {
        if (httpMethod === HttpMethod.DELETE) {
          await handleDeleteItems(data, endpoint, httpMethod);
          get().setFileOperationSuccessful(true, 'Delete Operation Successful', 200);
        } else if (action === ActionItems.MOVE || action === ActionItems.UPLOAD_FILE) {
          await handleArrayActions(data, endpoint, httpMethod);
          get().setFileOperationSuccessful(true, 'Operation Successful', 200);
        }
      } else {
        await eduApi[httpMethod](endpoint, data as Record<string, string>);
        get().setFileOperationSuccessful(true, 'Operation Successful', 200);
      }
    } catch (error) {
      console.error('Error during handleItemAction:', error);
      get().setFileOperationSuccessful(false, 'Something went wrong', 500);
    } finally {
      set({ isLoading: false, isDialogOpen: false });
    }
  },
}));

export default useFileSharingDialogStore;
