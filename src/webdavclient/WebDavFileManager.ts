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

    public async getFileDownloadLink(path: string): Promise<string> {
        const downloadLink = this.client.getFileDownloadLink(path)
        console.log(downloadLink)
        return downloadLink;
    }

    public async getFolderDownloadLink(path: string): Promise<void> {
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

    public async getUploadLink(path: string): Promise<string> {
        return this.client.getFileDownloadLink(path);
    }

    private async addItemsToZip(zip: JSZip, path: string): Promise<void> {
    const contentList = await this.getContentList(path);
    for (const item of contentList) {
        if (item.type === 'file') {
            try {
                const result = await this.client.getFileContents(`${item.filename}`, {format: "binary"});
                console.log(`Result type for ${item.filename}:`, typeof result, ArrayBuffer.isView(result));

                if (typeof result === 'string' || result instanceof ArrayBuffer || ArrayBuffer.isView(result)) {
                    zip.file(item.basename, result);
                } else if (result instanceof Blob) {
                    zip.file(item.basename, result);
                } else if (typeof result === 'object' && result !== null && 'data' in result) {
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


