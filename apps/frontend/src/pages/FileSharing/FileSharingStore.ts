import { RowSelectionState } from '@tanstack/react-table';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import eduApi from '@/api/eduApi';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import FileSharingApiEndpoints from '@libs/filesharing/fileSharingApiEndpoints';
import handleApiError from '@/utils/handleApiError';
import { clearPathFromWebdav } from '@/pages/FileSharing/utilities/fileManagerUtilits';
import { WebdavStatusReplay } from '@libs/filesharing/FileOperationResult';
import OnlyOfficeJwtTokenConfig from '@libs/filesharing/OnlyOfficeJwtType';
import { RequestResponseContentType } from '@libs/common/types/http-methods';

type FileSharingStore = {
  files: DirectoryFile[];
  selectedItems: DirectoryFile[];
  currentPath: string;
  currentlyEditingFile: DirectoryFile;
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
  setCurrentlyEditingFile: (fileToPreview: DirectoryFile) => void;
  setMountPoints: (mountPoints: DirectoryFile[]) => void;
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
  currentlyEditingFile: {} as DirectoryFile,
  mountPoints: [],
  directorys: [],
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

      setCurrentlyEditingFile: (fileToPreview: DirectoryFile) => {
        set({ currentlyEditingFile: fileToPreview });
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
        }
      },

      getDownloadLinkURL: async (filePath: string, filename: string) => {
        try {
          const response = await eduApi.get(`${FileSharingApiEndpoints.FILESHARING_ACTIONS}/downloadLink`, {
            params: {
              filePath,
              fileName: filename,
            },
          });
          const { data, success } = response.data as WebdavStatusReplay;
          if (success) {
            return data;
          }
          console.error('Failed to get the download link URL', response.status);
          throw new Error('Failed to get the download link URL');
        } catch (error) {
          console.error('Error getting the download link URL', error);
          throw error;
        }
      },

      downloadFile: async (filePath: string) => {
        try {
          const response = await eduApi.get(`${FileSharingApiEndpoints.FILESHARING_ACTIONS}/fileStream`, {
            params: { filePath },
            responseType: 'blob',
          });

          const blob = new Blob([response.data], { type: response.headers['content-type'] as string });
          return window.URL.createObjectURL(blob);
        } catch (error) {
          console.error('Error downloading the file:', error);
          throw error;
        }
      },

      fetchMountPoints: async () => {
        try {
          const resp = await eduApi.get(`${FileSharingApiEndpoints.FILESHARING_ROUTE}/`);
          set({ mountPoints: resp.data as DirectoryFile[] });
        } catch (error) {
          handleApiError(error, set);
        }
      },

      getOnlyOfficeJwtToken: async (config: OnlyOfficeJwtTokenConfig) => {
        try {
          const response = await eduApi.post(
            `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/oftoken/`,
            JSON.stringify(config),
            {
              headers: {
                'Content-Type': RequestResponseContentType.APPLICATION_JSON,
              },
            },
          );
          return response.data;
        } catch (error) {
          console.error('Error fetching OnlyOffice JWT token:', error);
          throw error;
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
        selectedItems: state.selectedItems,
        mountPoints: state.mountPoints,
      }),
    } as PersistOptions<FileSharingStore>,
  ),
);

export default useFileSharingStore;
