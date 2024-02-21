import {DirectoryFile} from "../../datatypes/filesystem.ts";


export interface IWebDavFileManager {
  getContentList: (path: string) => Promise<DirectoryFile[]>;
  createDirectory(path: string): Promise<boolean>
  createFile(path: string):  Promise<boolean>
  deleteItem(path: string): Promise<boolean>
  moveItem(path: string, toPath: string): Promise<boolean>
  renameItem(path: string, toPath: string): Promise<boolean>
  getFileDownloadLink(path: string): Promise<string>
  getFolderDownloadLink(path: string): Promise<void>
  getUploadLink(path: string): Promise<string>
}
