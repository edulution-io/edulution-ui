import {IWebDavFileManager} from "./IWebDavFileManager.ts";

import {createClient, WebDAVClient} from "webdav";
import {DirectoryFile} from "../../datatypes/filesystem.ts";
import {useFileManagerStore} from "@/store/appDataStore.ts";
import JSZip from 'jszip';
import {getFileNameFromPath} from "@/utils/common.ts";

export class WebDavFileManager implements IWebDavFileManager {
    private client: WebDAVClient;
    private setFileOperationSuccessfull = useFileManagerStore(state => state.setFileOperationSuccessful)

    constructor() {
        this.client = createClient(
            "http://localhost:5173/webdav/",
            {
                username: "netzint-teacher",
                password: "Muster!"
            },
        );
    }

    public getContentList = async (path: string): Promise<DirectoryFile[]> => {
        const result = await this.client.getDirectoryContents(path, {
            data: '<?xml version="1.0"?>\n' +
                '<d:propfind  xmlns:d="DAV:">\n' +
                '  <d:prop>\n' +
                '        <d:getlastmodified />\n' +
                '        <d:getetag />\n' +
                '        <d:getcontenttype />\n' +
                '        <d:getcontentlength />\n' +
                '        <d:displayname />\n' +
                '        <d:creationdate />\n' +
                '  </d:prop>\n' +
                '</d:propfind>'
        });
        if ('data' in result && Array.isArray(result.data)) {
            return result.data as DirectoryFile[];
        } else {
            return result as DirectoryFile[];
        }
    }

    public async createDirectory(path: string): Promise<boolean> {
        return await this.client.createDirectory(path)
            .then(() => {
                this.setFileOperationSuccessfull(true);
                return true;
            })
            .catch((error) => {
                this.setFileOperationSuccessfull(false);
                console.error("Error deleting file:", error);
                return false;
            });

    }

    public async createFile(path: string): Promise<boolean> {
        return await this.client.putFileContents(path, " ")
            .then(() => {
                this.setFileOperationSuccessfull(true);
                return true;
            })
            .catch((error) => {
                this.setFileOperationSuccessfull(false);
                console.error("Error deleting file:", error);
                return false;
            });

    }

    public async deleteItem(path: string): Promise<boolean> {
        return this.client.deleteFile(path)
            .then(() => {
                this.setFileOperationSuccessfull(true);
                return true;
            })
            .catch((error) => {
                this.setFileOperationSuccessfull(false);
                console.error("Error deleting file:", error);
                return false;
            });
    }

    public async renameItem(path: string, toPath: string): Promise<boolean> {
        try {
            console.log(`Attempting to move from ${path} to ${toPath}`);
            await this.client.moveFile(path, toPath)
            this.setFileOperationSuccessfull(true);
            console.log(`Moved successfully from ${path} to ${toPath}`);
            return true;
        } catch (error) {
            this.setFileOperationSuccessfull(false);
            console.error("Error moving file:", error);
            console.log(`Failed to move from ${path} to ${toPath}`);
            return false;
        }
    }


    public async moveItem(path: string, toPath: string): Promise<boolean> {
        try {
            await this.client.copyFile(path, toPath)
            return true
        } catch (e) {
            console.error("Creation failed!")
            return false
        }
    }

    public async triggerFileDownload(path: string): Promise<void> {
        const downloadLink = this.client.getFileDownloadLink(path);
        console.log(downloadLink);
        const anchor = document.createElement('a');
        anchor.href = downloadLink;
        anchor.setAttribute(getFileNameFromPath(path), '');
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    //TODO move it later to backend or to lmn server
    public async triggerFolderDownload(path: string): Promise<void> {
        const zip = new JSZip();
        await this.addItemsToZip(zip, path);

        zip.generateAsync({type: "blob"})
            .then((content: Blob | MediaSource) => {
                const url = URL.createObjectURL(content);
                const a = document.createElement("a");
                a.href = url;
                a.download = getFileNameFromPath(path);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
    }
    //TODO move it later to backend or to lmn server
     public async triggerMultipleFolderDownload(folders: DirectoryFile[]): Promise<void> {
        console.log(folders.map((item) => {
            console.log(item.filename)
        }))
         const zip = new JSZip();
         for(const item of folders){
             await this.addItemsToZip(zip, item.filename);
         }
         zip.generateAsync({type: "blob"})
             .then((content: Blob | MediaSource) => {
                 const url = URL.createObjectURL(content);
                 const a = document.createElement("a");
                 a.href = url;
                 a.download = "download.zip"
                 document.body.appendChild(a);
                 a.click();
                 document.body.removeChild(a);
             });
     }

    public async getUploadLink(path: string): Promise<string> {
        return this.client.getFileDownloadLink(path);
    }

    private async addItemsToZip(zip: JSZip, path: string): Promise<void> {
        const folderName = path.split('/').filter(Boolean).pop() || 'Folder';

        const folderZip = zip.folder(folderName);
        const contentList = await this.getContentList(path);

        for (const item of contentList) {
            console.log(item.filename.split("/"), "LLLLLLL")
            if (item.type === 'file') {
                try {
                    const result = await this.client.getFileContents(`${item.filename}`, {format: "binary"});
                    console.log(`Result type for ${item.filename}:`, typeof result, ArrayBuffer.isView(result));

                    if (typeof result === 'string' || result instanceof ArrayBuffer || ArrayBuffer.isView(result)) {
                        if(folderZip != null){
                            folderZip.file(item.basename, result);
                        }
                    } else if (result instanceof Blob && folderZip != null) {
                        folderZip.file(item.basename, result);
                    } else if (typeof result === 'object' && result !== null && 'data' in result && folderZip != null) {
                        const data = result.data;
                        if (typeof data === 'string' || ArrayBuffer.isView(data)) {
                            zip.file(item.basename, data);
                        } else {
                            console.error(`Unsupported data type within ResponseDataDetailed for file: ${item.filename}`);
                        }
                    } else {
                        console.error(`Unsupported data type for file: ${item.filename}`);
                    }
                } catch (error) {
                    console.error(`Error fetching file content for ${item.filename}:`, error);
                }
            } else if (item.type === 'directory') {
                const folderPath = `${path}/${item.basename}`;
                const folder = zip.folder(item.basename);
                if (folder !== null) {
                    await this.addItemsToZip(folder, folderPath);
                }
            }
        }
    }


}


