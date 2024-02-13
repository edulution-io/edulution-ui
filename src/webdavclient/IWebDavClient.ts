import {DirectoryFile} from "../../datatypes/filesystem.ts";


interface IWebDavClient {
  getAllFilesAndDirectories: (path: string) => Promise<DirectoryFile[]>;
}

export default IWebDavClient;