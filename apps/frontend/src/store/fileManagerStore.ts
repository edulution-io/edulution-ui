import create, { StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { DirectoryFile } from '@/datatypes/filesystem';
import { RowSelectionState } from '@tanstack/react-table';
import eduApi from '@/api/eduApi';
import { getFileNameFromPath } from '@/pages/FileSharing/utilities/fileManagerCommon';
import { QrCodeValues } from '@/pages/FileSharing/utilities/types.ts';

type WebDavActionResult = { success: boolean; message?: string; status?: number };

interface FileManagerState {
  directorys: DirectoryFile[];
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
  QRCode: QrCodeValues;
}

interface FileManagerActions {
  resetProgress: () => void;
  setSelectedRows: (rows: RowSelectionState) => void;
  setCurrentPath: (path: string) => void;
  setFiles: (files: DirectoryFile[]) => void;
  setDirectorys: (files: DirectoryFile[]) => void;
  setMountPoints: (mountPoints: DirectoryFile[]) => void;
  setFileName: (fileName: string) => void;
  setDirectoryName: (directoryName: string) => void;
  setSelectedItems: (items: DirectoryFile[]) => void;
  setFileOperationSuccessful: (success: boolean | undefined, message: string) => Promise<void>;
  setPopUpVisibility: (isVisible: boolean) => void;
  fetchFiles: (path: string) => Promise<void>;
  fetchDirs: (path: string) => Promise<void>;
  fetchMountPoints: () => Promise<void>;
  fetchQRCode: () => Promise<void>;
  uploadFile: (file: File, path: string) => Promise<WebDavActionResult>;
  handleWebDavAction: (action: () => Promise<WebDavActionResult>) => Promise<WebDavActionResult>;
  createNewFolder: (folderName: string, path: string) => Promise<WebDavActionResult>;
  createNewFile: (fileName: string, path: string) => Promise<WebDavActionResult>;
  renameItem: (path: string, newPath: string) => Promise<WebDavActionResult>;
  downloadFile: (path: string) => Promise<WebDavActionResult>;
  moveItem: (originPath: string, newPath: string) => Promise<WebDavActionResult>;
  deleteItem: (path: string) => Promise<WebDavActionResult>;
  reset: () => void;
}

type FileManagerStore = FileManagerState & FileManagerActions;

const initialState: Omit<
  FileManagerStore,
  | 'setUploadProgress'
  | 'resetProgress'
  | 'uploadFile'
  | 'setSelectedRows'
  | 'downloadFile'
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
  | 'fetchDirs'
  | 'reset'
  | 'handleWebDavAction'
  | 'setDirectorys'
  | 'createNewFolder'
  | 'createNewFile'
  | 'renameItem'
  | 'moveItem'
  | 'deleteItem'
  | 'fetchQRCode'
> = {
  files: [],
  directorys: [],
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
  QRCode: {} as QrCodeValues,
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

      setDirectorys: (directorys: DirectoryFile[]) => {
        set({ directorys });
      },

      fetchQRCode: async () => {
        try {
          const response = await eduApi.get<QrCodeValues>('/filemanager/qrcode');
          set({ QRCode: response.data });
        } catch (error) {
          console.error('Error fetching QR code:', error);
        }
      },

      downloadFile: async (path: string) => {
        try {
          const response = await eduApi.get(`/filemanager/download/${path}`);
          return { response, success: true };
        } catch (error) {
          console.error('Error downloading file:', error);
          return { success: false };
        }
      },

      uploadFile: async (file: File, path: string) => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('name', file.name);
          formData.append('path', path.replace('/webdav/', ''));

          const response = await eduApi.put('/filemanager/uploadFile', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          return { response, success: true };
        } catch (error) {
          console.error('Error uploading file:', error);
          return { success: false };
        }
      },

      createNewFile: async (fileName, path) => {
        try {
          const response = await eduApi.put('/filemanager/createfile', {
            path: path.replace('/webdav/', ''),
            fileName,
            content: '',
          });
          return { response, success: true };
        } catch (error) {
          console.error('Error creating file:', error);
          return { success: false };
        }
      },

      createNewFolder: async (folderName, path) => {
        try {
          const response = await eduApi.post('/filemanager/createFolder', {
            path: path.replace('/webdav/', ''),
            folderName,
          });
          return { response, success: true };
        } catch (error) {
          console.error('Error creating folder:', error);
          return { success: false };
        }
      },

      renameItem: async (originPath: string, newPath: string) => {
        try {
          const response = await eduApi.put('/filemanager/rename', {
            originPath: originPath.replace('/webdav/', ''),
            newPath: newPath.replace('/webdav/', ''),
          });
          return { response, success: true };
        } catch (error) {
          return { success: false };
        }
      },

      moveItem: async (originPath: string, newPath: string) => {
        try {
          const response = await eduApi.put('/filemanager/move', {
            originPath: originPath.replace('/webdav/', ''),
            newPath: `${newPath.replace('/webdav/', '')}/${getFileNameFromPath(originPath)}`,
          });
          return { response, success: true };
        } catch (error) {
          console.error('Error moving item:', error);
          return { success: false };
        }
      },

      deleteItem: async (path: string) => {
        try {
          const response = await eduApi.delete(`/filemanager/delete/${path}`);
          return { response, success: true };
        } catch (error) {
          console.error('Error deleting item:', error);
          return { success: false };
        }
      },

      fetchFiles: async (path: string) => {
        try {
          const directoryFiles = await eduApi.get(`/filemanager/files/${path.replace('/webdav/', '')}`);
          get().setCurrentPath(path);
          get().setFiles(directoryFiles.data as DirectoryFile[]);
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
          const resp = await eduApi.get('/filemanager/mountpoints');
          get().setMountPoints(resp.data as DirectoryFile[]);
        } catch (error) {
          console.error('Error fetching mount points:', error);
        }
      },

      fetchDirs: async (path: string) => {
        try {
          const directoryFiles = await eduApi.get(`/filemanager/dirs/${path.replace('/webdav/', '')}`);
          get().setDirectorys(directoryFiles.data as DirectoryFile[]);
        } catch (error) {
          console.error('Error fetching directory contents:', error);
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
