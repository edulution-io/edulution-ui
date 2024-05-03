import { DirectoryFile } from '@/datatypes/filesystem';

export interface IWebDavFileManager {
  getContentList(path: string): Promise<DirectoryFile[]>;
  createDirectory(
    path: string,
    folderName: string,
  ): Promise<
    | { success: boolean; message: string; status: number }
    | {
        success: boolean;
      }
  >;
  createFile(
    path: string,
    fileName: string,
  ): Promise<
    | { success: boolean; message: string; status: number }
    | {
        success: boolean;
      }
  >;
  deleteItem(path: string): Promise<
    | { success: boolean; message: string; status: number }
    | {
        success: boolean;
      }
  >;
  moveItems(
    items: DirectoryFile[] | DirectoryFile,
    toPath: string | undefined,
  ): Promise<
    | { success: boolean; message: string; status: number }
    | {
        success: boolean;
      }
  >;
  renameItem(
    path: string,
    toPath: string,
  ): Promise<
    | { success: boolean; message: string; status: number }
    | {
        success: boolean;
      }
  >;
  triggerFileDownload(path: string): void;
  triggerFolderDownload(path: string): Promise<void>;
  triggerMultipleFolderDownload(folders: DirectoryFile[]): Promise<void>;

  uploadFile(
    file: File,
    remotePath: string,
    onProgress: (percentage: number) => void,
  ): Promise<{ success: boolean; message: string; status: number } | { success: boolean }>;

  uploadMultipleFiles(
    files: File[],
    remotePath: string,
    updateUI: (file: File, progress: number) => void,
  ): Promise<Array<{ success: boolean; message: string; status: number } | { success: boolean }>>;
}
