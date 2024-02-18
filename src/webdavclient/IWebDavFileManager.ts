import {DirectoryFile} from "../../datatypes/filesystem.ts";


export interface IWebDavFileManager {
  getContentList: (path: string) => Promise<DirectoryFile[]>;
  createDirectory(path: string): Promise<boolean>
  createFile(path: string):  Promise<boolean>
}
