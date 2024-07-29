import { RowSelectionState } from '@tanstack/react-table';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import eduApi from '@/api/eduApi';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import handleApiError from '@/utils/handleApiError';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import ContentType from '@libs/filesharing/types/contentType';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';

type FileSharingStore = {
  files: DirectoryFileDTO[];
  selectedItems: DirectoryFileDTO[];
  currentPath: string;
  pathToRestoreSession: string;
  setDirectorys: (files: DirectoryFileDTO[]) => void;
  directorys: DirectoryFileDTO[];
  selectedRows: RowSelectionState;
  setSelectedRows: (rows: RowSelectionState) => void;
  setCurrentPath: (path: string) => void;
  setPathToRestoreSession: (path: string) => void;
  setFiles: (files: DirectoryFileDTO[]) => void;
  setSelectedItems: (items: DirectoryFileDTO[]) => void;
  fetchFiles: (path?: string) => Promise<void>;
  fetchMountPoints: () => Promise<void>;
  fetchDirs: (path: string) => Promise<void>;
  reset: () => void;
  mountPoints: DirectoryFileDTO[];
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setMountPoints: (mountPoints: DirectoryFileDTO[]) => void;
  downloadFile: (filePath: string) => Promise<string | undefined>;
};

const initialState = {
  files: [],
  selectedItems: [],
  currentPath: `/`,
  pathToRestoreSession: `/`,
  downloadLinkURL: '',
  selectedRows: {},
  mountPoints: [],
  directorys: [],
  isLoading: false,
};

type PersistedFileManagerStore = (
  fileManagerData: StateCreator<FileSharingStore>,
  options: PersistOptions<FileSharingStore>,
) => StateCreator<FileSharingStore>;

const buildFileSharingUrl = (base: string, type: ContentType, path: string): string =>
  `${base}?type=${type}&path=${path}`;

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
      setFiles: (files: DirectoryFileDTO[]) => {
        set({ files });
      },

      setMountPoints: (mountPoints: DirectoryFileDTO[]) => {
        set({ mountPoints });
      },

      setDirectorys: (directorys: DirectoryFileDTO[]) => {
        set({ directorys });
      },

      setIsLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      fetchFiles: async (path: string = '/') => {
        try {
          set({ isLoading: true });
          const directoryFiles = await eduApi.get<DirectoryFileDTO[]>(
            `${buildFileSharingUrl(FileSharingApiEndpoints.BASE, ContentType.FILE, path)}`,
          );
          set({
            currentPath: path,
            files: directoryFiles.data,
            selectedItems: [],
            selectedRows: {},
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      downloadFile: async (filePath: string) => {
        try {
          set({ isLoading: true });
          const fileStreamResponse = await eduApi.get<Blob>(
            `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.GET_FILE_STREAM}`,
            {
              params: { filePath },
              responseType: 'blob',
            },
          );

          const fileStream = fileStreamResponse.data;
          return window.URL.createObjectURL(fileStream);
        } catch (error) {
          handleApiError(error, set);
          return '';
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMountPoints: async () => {
        try {
          set({ isLoading: true });
          const resp = await eduApi.get<DirectoryFileDTO[]>(
            `${buildFileSharingUrl(FileSharingApiEndpoints.BASE, ContentType.FILE, '')}`,
          );
          set({ mountPoints: resp.data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchDirs: async (path: string) => {
        try {
          const directoryFiles = await eduApi.get(
            `${buildFileSharingUrl(FileSharingApiEndpoints.BASE, ContentType.DIRECTORY, getPathWithoutWebdav(path))}`,
          );
          set({ directorys: directoryFiles.data as DirectoryFileDTO[] });
        } catch (error) {
          handleApiError(error, set);
        }
      },

      setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
      setSelectedItems: (items: DirectoryFileDTO[]) => set({ selectedItems: items }),

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
