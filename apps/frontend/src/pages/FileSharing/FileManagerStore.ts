import { RowSelectionState } from '@tanstack/react-table';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import eduApi from '@/api/eduApi';
import APIPATH from '@/pages/FileSharing/utilities/apiPath';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

type FileManagerStore = {
  files: DirectoryFile[];
  selectedItems: DirectoryFile[];
  currentPath: string;
  pathToRestoreSession: string;
  setDirectorys: (files: DirectoryFile[]) => void;
  directorys: DirectoryFile[];
  selectedRows: RowSelectionState;
  setSelectedRows: (rows: RowSelectionState) => void;
  setCurrentPath: (path: string) => void;
  setPathToRestoreSession: (path: string) => void;
  setFiles: (files: DirectoryFile[]) => void;
  setSelectedItems: (items: DirectoryFile[]) => void;
  fetchFiles: (path?: string) => Promise<void>;
  fetchMountPoints: () => Promise<void>;
  fetchDirs: (path: string) => Promise<void>;
  reset: () => void;
  mountPoints: DirectoryFile[];
  setMountPoints: (mountPoints: DirectoryFile[]) => void;
};

const initialState: Omit<
  FileManagerStore,
  | 'setSelectedRows'
  | 'setCurrentPath'
  | 'setFiles'
  | 'setDirectorys'
  | 'setSelectedItems'
  | 'fetchFiles'
  | 'fetchMountPoints'
  | 'fetchDirs'
  | 'reset'
  | 'setMountPoints'
  | 'setPathToRestoreSession'
> = {
  files: [],
  selectedItems: [],
  currentPath: `/`,
  pathToRestoreSession: `/`,
  selectedRows: {},
  mountPoints: [],
  directorys: [],
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
        set({ currentPath: path });
      },

      setPathToRestoreSession: (path: string) => {
        set({ pathToRestoreSession: path });
      },
      setFiles: (files: DirectoryFile[]) => {
        set({ files });
      },

      setMountPoints: (mountPoints: DirectoryFile[]) => {
        set({ mountPoints });
      },

      setDirectorys: (directorys: DirectoryFile[]) => {
        set({ directorys });
      },

      fetchFiles: async (path: string = '/') => {
        try {
          const directoryFiles = await eduApi.get(`${APIPATH.FILESHARING_ROUTE}${path.replace('/webdav/', '')}`);
          get().setCurrentPath(path);
          get().setFiles(directoryFiles.data as DirectoryFile[]);
          get().setSelectedItems([]);
          get().setSelectedRows({});
        } catch (error) {
          console.error('Error fetching files:', error);
        }
      },

      fetchMountPoints: async () => {
        try {
          const resp = await eduApi.get(`${APIPATH.FILESHARING_ROUTE}`);
          get().setMountPoints(resp.data as DirectoryFile[]);
        } catch (error) {
          console.error('Error fetching mount points:', error);
        }
      },

      fetchDirs: async (path: string) => {
        try {
          const directoryFiles = await eduApi.get(`${APIPATH.FILESHARING_ACTIONS}dirs/${path.replace('/webdav/', '')}`);
          get().setDirectorys(directoryFiles.data as DirectoryFile[]);
        } catch (error) {
          console.error('Error fetching directory contents:', error);
        }
      },

      setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
      setSelectedItems: (items: DirectoryFile[]) => set({ selectedItems: items }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'filemanagerstorage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        files: state.files,
        currentPath: state.currentPath,
        selectedItems: state.selectedItems,
        mountPoints: state.mountPoints,
      }),
    } as PersistOptions<FileManagerStore>,
  ),
);

export default useFileManagerStore;
