import create, { StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import { ContentType, DirectoryFile } from '@/datatypes/filesystem';
import { RowSelectionState } from '@tanstack/react-table';
import { fetchFilesFromPath, fetchMountPoints } from '@/webdavclient/WebDavAPI';

type WebDavActionResult = { success: boolean; message: string; status: number } | { success: boolean };

interface FileManagerState {
  files: DirectoryFile[];
  mountPoints: DirectoryFile[];
  isVisible: boolean;
  fileName: string;
  directoryName: string;
  selectedItems: DirectoryFile[];
  fileOperationSuccessful: boolean | undefined;
  currentPath: string;
  uploadProgresses: { [key: string]: number };
  fileOperationMessage: string;
  selectedRows: RowSelectionState;
}

interface FileManagerActions {
  resetProgress: () => void;
  setSelectedRows: (rows: RowSelectionState) => void;
  setCurrentPath: (path: string) => void;
  setFiles: (files: DirectoryFile[]) => void;
  setMountPoints: (mountPoints: DirectoryFile[]) => void;
  setFileName: (fileName: string) => void;
  setDirectoryName: (directoryName: string) => void;
  setSelectedItems: (items: DirectoryFile[]) => void;
  setFileOperationSuccessful: (success: boolean | undefined, message: string) => Promise<void>;
  setPopUpVisibility: (isVisible: boolean) => void;
  fetchFiles: (path: string) => Promise<void>;
  fetchMountPoints: () => Promise<DirectoryFile[]>;
  fetchDirectory: (path: string) => Promise<DirectoryFile[]>;
  handleWebDavAction: (action: () => Promise<WebDavActionResult>) => Promise<WebDavActionResult>;
  reset: () => void;
}
type FileManagerStore = FileManagerState & FileManagerActions;

const initialState: Omit<
  FileManagerStore,
  | 'setUploadProgress'
  | 'resetProgress'
  | 'setSelectedRows'
  | 'setCurrentPath'
  | 'setFiles'
  | 'setMountPoints'
  | 'setFileName'
  | 'setDirectoryName'
  | 'setSelectedItems'
  | 'setFileOperationSuccessful'
  | 'fetchFiles'
  | 'handleDownload'
  | 'setPopUpVisibility'
  | 'fetchMountPoints'
  | 'fetchDirectory'
  | 'reset'
  | 'handleWebDavAction'
> = {
  files: [],
  mountPoints: [],
  isVisible: false,
  fileName: '',
  directoryName: '',
  selectedItems: [],
  fileOperationSuccessful: undefined,
  currentPath: `/`,
  uploadProgresses: {},
  fileOperationMessage: '',
  selectedRows: {},
};

type PersistedFileManagerStore = (
  fileManagerData: StateCreator<FileManagerStore>,
  options: PersistOptions<FileManagerStore>,
) => StateCreator<FileManagerStore>;

const useFileManagerStore = create<FileManagerStore>(
  (persist as PersistedFileManagerStore)(
    (set, get) => ({
      ...initialState,
      setCurrentPath: (path: string) => {
        set({ currentPath: path.replace('/webdav', '') });
      },

      setFiles: (files: DirectoryFile[]) => {
        set({ files });
      },

      setMountPoints: (mountPoints: DirectoryFile[]) => {
        set({ mountPoints });
      },

      fetchFiles: async (path: string) => {
        try {
          console.log(`fetchFiles${path}`);
          const directoryFiles = await fetchFilesFromPath(path);
          get().setCurrentPath(path);
          get().setFiles(directoryFiles);
          get().setSelectedItems([]);
          get().setSelectedRows({});
          if (get().fileOperationSuccessful !== undefined) {
            get().setPopUpVisibility(true);
          }
        } catch (error) {
          console.error('Error fetching files:', error);
        }
      },

      fetchMountPoints: async () => {
        try {
          console.log(fetchMountPoints().then((res) => console.log(res)));
          return await fetchMountPoints();
        } catch (error) {
          console.error('Error fetching mount points:', error);
          return [];
        }
      },

      fetchDirectory: async (pathToFetch: string) => {
        try {
          const resp = await fetchFilesFromPath(pathToFetch);
          return resp.filter((item) => item.type === ContentType.directory);
        } catch (error) {
          console.error('Error fetching directory contents:', error);
          return [];
        }
      },

      resetProgress: () => set({ uploadProgresses: {} }),

      setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
      setFileName: (fileName: string) => set({ fileName }),
      setDirectoryName: (directoryName: string) => set({ directoryName }),
      setSelectedItems: (items: DirectoryFile[]) => set({ selectedItems: items }),
      setPopUpVisibility: (isVisible: boolean) => {
        set({ isVisible });
        if (isVisible) {
          setTimeout(() => {
            set({ isVisible: false });
          }, 3000);
        }
      },

      setFileOperationSuccessful: async (fileOperationSuccessful: boolean | undefined, message: string) => {
        set({ fileOperationSuccessful, fileOperationMessage: message });
        if (fileOperationSuccessful !== undefined) {
          await get().fetchFiles(get().currentPath);
          setTimeout(() => {
            set({ fileOperationSuccessful: undefined, fileOperationMessage: '' });
          }, 4000);
        }
        console.log('File operation successful:', fileOperationSuccessful, message);
      },

      handleWebDavAction: async (action: () => Promise<WebDavActionResult>) => {
        try {
          return await action();
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error('Error executing WebDAV action:', error);
            return { success: false, message: error.message, status: 500 };
          }
          console.error('An unexpected error occurred:', error);
          return { success: false, message: 'Unknown error', status: 500 };
        }
      },
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'fileManagerStorage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        mountPoints: state.mountPoints,
        files: state.files,
      }),
    } as PersistOptions<FileManagerStore>,
  ),
);

export default useFileManagerStore;
