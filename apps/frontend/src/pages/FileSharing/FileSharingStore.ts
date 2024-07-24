import { RowSelectionState } from '@tanstack/react-table';
import { DirectoryFileDTO } from '@libs/filesharing/DirectoryFileDTO';
import eduApi from '@/api/eduApi';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import handleApiError from '@/utils/handleApiError';
import { clearPathFromWebdav } from '@/pages/FileSharing/utilities/filesharingUtilities';
import { WebdavStatusReplay } from '@libs/filesharing/FileOperationResult';
import FileSharingApiEndpoints from '@libs/filesharing/FileSharingApiEndpoints';

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
  getDownloadLinkURL: (filePath: string, filename: string) => Promise<string | undefined>;
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
          const directoryFiles = await eduApi.get(
            `${FileSharingApiEndpoints.BASE}/${FileSharingApiEndpoints.FILES_ENDPOINT}${clearPathFromWebdav(path)}`,
          );
          set({
            currentPath: path,
            files: directoryFiles.data as DirectoryFileDTO[],
            selectedItems: [],
            selectedRows: {},
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      getDownloadLinkURL: async (filePath: string, filename: string) => {
        try {
          set({ isLoading: true });
          const response = await eduApi.get<WebdavStatusReplay>(
            `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.GET_DOWNLOAD_LINK}`,
            {
              params: {
                filePath,
                fileName: filename,
              },
            },
          );
          const { data, success } = response.data;
          if (success && data) {
            return data;
          }
          return '';
        } catch (error) {
          handleApiError(error, set);
          return '';
        } finally {
          set({ isLoading: false });
        }
      },

      downloadFile: async (filePath: string) => {
        try {
          set({ isLoading: true });
          const fileStreamResponse = await eduApi.get<Blob>(
            `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.FILE_STREAM}`,
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
          const resp = await eduApi.get(`${FileSharingApiEndpoints.BASE}/${FileSharingApiEndpoints.FILES_ENDPOINT}`);
          set({ mountPoints: resp.data as DirectoryFileDTO[] });
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
