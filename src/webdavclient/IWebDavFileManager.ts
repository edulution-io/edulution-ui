import {DirectoryFile} from "../../datatypes/filesystem.ts";


export interface IWebDavFileManager {
  getContentList: (path: string) => Promise<DirectoryFile[]>;
  createDirectory(path: string): Promise<boolean>
  createFile(path: string):  Promise<boolean>
  deleteItem(path: string): Promise<boolean>
  moveItem(path: string, toPath: string): Promise<boolean>
  renameItem(path: string, toPath: string): Promise<boolean>
  triggerFileDownload(path: string): Promise<void>
  triggerFolderDownload(path: string): Promise<void>
  triggerMultipleFolderDownload(folders: DirectoryFile[]): Promise<void>
  uploadFile(file: File, remotePath: string): Promise<void>
}
