import { DirectoryFile } from '../../datatypes/filesystem';

export interface IWebDavFileManager {
  getContentList(path: string): Promise<DirectoryFile[]>;
  createDirectory(path: string): Promise<
    | { success: boolean; message: string; status: number }
    | {
        success: boolean;
      }
  >;
  createFile(path: string): Promise<
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
  ): Promise<
    | { success: boolean; message: string; status: number }
    | {
        success: boolean;
      }
  >;
}
