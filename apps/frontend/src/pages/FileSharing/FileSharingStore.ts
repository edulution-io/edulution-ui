import { RowSelectionState } from '@tanstack/react-table';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import eduApi from '@/api/eduApi';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import FileSharingApiEndpoints from '@libs/filesharing/fileSharingApiEndpoints';
import handleApiError from '@/utils/handleApiError';
import { clearPathFromWebdav } from '@/pages/FileSharing/utilities/filesharingUtilities';

type FileSharingStore = {
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
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setMountPoints: (mountPoints: DirectoryFile[]) => void;
};

const initialState = {
  files: [],
  selectedItems: [],
  currentPath: `/`,
  pathToRestoreSession: `/`,
  selectedRows: {},
  mountPoints: [],
  directorys: [],
  isLoading: false,
};

type PersistedFileManagerStore = (
  fileManagerData: StateCreator<FileSharingStore>,
  options: PersistOptions<FileSharingStore>,
) => StateCreator<FileSharingStore>;

const useFileSharingStore = create<FileSharingStore>(
  (persist as PersistedFileManagerStore)(
    (set) => ({
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

      setIsLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      fetchFiles: async (path: string = '/') => {
        try {
          set({ isLoading: true });
          const directoryFiles = await eduApi.get(
            `${FileSharingApiEndpoints.FILESHARING_ROUTE}/${clearPathFromWebdav(path)}`,
          );
          set({
            currentPath: path,
            files: directoryFiles.data as DirectoryFile[],
            selectedItems: [],
            selectedRows: {},
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMountPoints: async () => {
        try {
          set({ isLoading: true });
          const resp = await eduApi.get(`${FileSharingApiEndpoints.FILESHARING_ROUTE}/`);
          set({ mountPoints: resp.data as DirectoryFile[] });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchDirs: async (path: string) => {
        try {
          const directoryFiles = await eduApi.get(
            `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/dirs/${clearPathFromWebdav(path)}`,
          );
          set({ directorys: directoryFiles.data as DirectoryFile[] });
        } catch (error) {
          handleApiError(error, set);
        }
      },

      setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
      setSelectedItems: (items: DirectoryFile[]) => set({ selectedItems: items }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'filesharing-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        files: state.files,
        currentPath: state.currentPath,
        mountPoints: state.mountPoints,
      }),
    } as PersistOptions<FileSharingStore>,
  ),
);

export default useFileSharingStore;
