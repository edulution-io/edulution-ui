import { DirectoryFile } from '../../datatypes/filesystem';

export interface IWebDavFileManager {
  getContentList: (path: string) => Promise<DirectoryFile[]>;
  createDirectory(path: string): Promise<boolean>;
  createFile(path: string): Promise<boolean>;
  deleteItem(path: string): Promise<boolean>;
  moveItems(items: DirectoryFile[] | DirectoryFile, toPath: string | undefined): Promise<boolean>;
  renameItem(path: string, toPath: string): Promise<boolean>;
  triggerFileDownload(path: string): void;
  triggerFolderDownload(path: string): Promise<void>;
  triggerMultipleFolderDownload(folders: DirectoryFile[]): Promise<void>;
  uploadFile(file: File, remotePath: string): void;
}
