import { create } from 'zustand';
import {ContentType, DirectoryFile} from "@/datatypes/filesystem";
import { RowSelectionState } from "@tanstack/react-table";
import WebDavFunctions from '@/webdavclient/WebDavFileManager';

type WebDavActionResult =
  | { success: boolean; message: string; status: number }
  | { success: boolean };

type FileManagerStore = {
  files: DirectoryFile[];
  isLoading: boolean;
  isVisible: boolean;
  fileName: string;
  directoryName: string;
  selectedItems: DirectoryFile[];
  fileOperationSuccessful: boolean | undefined;
  currentPath: string;
  uploadProgresses: { [key: string]: number };
  fileOperationMessage: string;
  selectedRows: RowSelectionState;
  setUploadProgress: (fileName: string, percentage: number) => void;
  resetProgress: () => void;
  setSelectedRows: (rows: RowSelectionState) => void;
  setCurrentPath: (path: string) => void;
  setFiles: (files: DirectoryFile[]) => void;
  setFileName: (fileName: string) => void;
  setDirectoryName: (directoryName: string) => void;
  setSelectedItems: (items: DirectoryFile[]) => void;
  setFileOperationSuccessful: (fileOperationSuccessful: boolean | undefined, message: string) => void;
  fetchFiles: (path?: string) => Promise<void>;
  handleDownload: (items: DirectoryFile[]) => Promise<void>;
  setPopUpVisibility: (isVisible: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  fetchMountPoints: () => Promise<DirectoryFile[]>;
  fetchDirectory: (path?: string) => Promise<DirectoryFile[]>;
  handleWebDavAction: (action: () => Promise<WebDavActionResult>) => Promise<WebDavActionResult>;
};

const useFileManagerStore = create<FileManagerStore>((set, get) => ({
  files: [],
  isLoading: false,
  currentPath: '/',
  isVisible: false,
  fileName: '',
  directoryName: '',
  selectedItems: [],
  fileOperationSuccessful: undefined,
  uploadProgresses: {},
  fileOperationMessage: '',
  selectedRows: {},

  setCurrentPath: (path: string) => {
    set({ currentPath: path });
  },

  setFiles: (files: DirectoryFile[]) => {
    set({ files });
  },


    fetchFiles: async (path: string = get().currentPath) => {
    try {
      const directoryFiles = await WebDavFunctions.getContentList(path);
      get().setCurrentPath(path);
      get().setFiles(directoryFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  },

  fetchMountPoints: async () => {
    try {
      return await WebDavFunctions.getContentList('/');
    } catch (error) {
      console.error('Error fetching mount points:', error);
      return [];
    }
  },

  fetchDirectory: async (pathToFetch: string = '/teachers/netzint-teacher') => {
    try {
      const resp = await WebDavFunctions.getContentList(pathToFetch);
      return resp.filter((item) => item.type === ContentType.directory);
    } catch (error) {
      console.error('Error fetching directory contents:', error);
      return [];
    }
  },

handleDownload: async (items: DirectoryFile[]) => {
  set({ isLoading: true });
  try {
    await WebDavFunctions.triggerMultipleFolderDownload(items);
    set({ isLoading: false, isVisible: true });
    setTimeout(() => {
      set({ isVisible: false });
    }, 3000);
  } catch (error) {
    set({ isLoading: false });
    throw error;
  }
  },

  setUploadProgress: (fileName: string, percentage: number) =>
    set((state) => ({
      uploadProgresses: {
        ...state.uploadProgresses,
        [fileName]: percentage,
      },
    })),

  resetProgress: () => set({ uploadProgresses: {} }),

  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
  setFileName: (fileName: string) => set({ fileName }),
  setDirectoryName: (directoryName: string) => set({ directoryName }),
  setSelectedItems: (items: DirectoryFile[]) => set({ selectedItems: items }),
  setFileOperationSuccessful: (fileOperationSuccessful: boolean | undefined, message: string) =>
    set({ fileOperationSuccessful, fileOperationMessage: message }),

  setPopUpVisibility: (isVisible: boolean) => set({ isVisible }),
  setLoading: (isLoading: boolean) => set({ isLoading }),

  handleWebDavAction: async (action: () => Promise<WebDavActionResult>) => {
    try {
      return await action();
    } catch (error) {
      console.error('Error executing WebDAV action:', error);
      return { success: false, message: error.message || 'Unknown error', status: 500 };
    }
  },
}));


export default useFileManagerStore;
