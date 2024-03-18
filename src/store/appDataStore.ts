import { create } from 'zustand';
import { RowSelectionState } from '@tanstack/react-table';
import { DirectoryFile } from '@/datatypes/filesystem';

type Store = {
  appName: string;
  setAppName: (appName: string) => void;
};

type FileManager = {
  fileName: string;
  directoryName: string;
  selectedItems: DirectoryFile[];
  fileOperationSuccessful: boolean | undefined;
  currentPath: string;
  uploadProgresses: { [key: string]: number };
  fileOperationMessage: string;
  setUploadProgress: (fileName: string, percentage: number) => void;
  resetProgress: () => void;
  selectedRows: RowSelectionState;
  setSelectedRows: (rows: RowSelectionState) => void;
  setCurrentPath: (path: string) => void;
  setFileName: (fileName: string) => void;
  setDirectoryName: (directoryName: string) => void;
  setSelectedItems: (items: DirectoryFile[]) => void;
  setFileOperationSuccessful: (fileOperationSuccessful: undefined | boolean, message: string) => void;
};

export const useAppDataStore = create<Store>((set) => ({
  appName: 'Edulution UI',
  setAppName: (appName: string) => {
    set({ appName });
  },
}));

export const useFileManagerStore = create<FileManager>((set) => ({
  fileName: '',
  directoryName: '',
  selectedItems: [],
  fileOperationSuccessful: undefined,
  fileOperationMessage: '',
  currentPath: '/',
  selectedRows: {},
  uploadProgresses: {},
  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
  setCurrentPath: (currentPath: string) => set({ currentPath }),
  setFileName: (fileName: string) => set({ fileName }),
  setDirectoryName: (directoryName: string) => set({ directoryName }),
  setSelectedItems: (items: DirectoryFile[]) => set({ selectedItems: items }),
  setFileOperationSuccessful: (fileOperationSuccessful: boolean | undefined, message: string) =>
    set({ fileOperationSuccessful, fileOperationMessage: message }),
  setUploadProgress: (fileName, percentage) =>
    set((state) => ({
      uploadProgresses: {
        ...state.uploadProgresses,
        [fileName]: percentage,
      },
    })),
  resetProgress: () => set({ uploadProgresses: {} }),
}));
