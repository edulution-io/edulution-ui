import {IWebDavFileManager} from "./IWebDavFileManager.ts";

import {createClient, WebDAVClient} from "webdav";
import {DirectoryFile} from "../../datatypes/filesystem.ts";
import {useFileManagerStore} from "@/store/appDataStore.ts";
import JSZip from 'jszip';
import {getFileNameFromPath} from "@/utils/common.ts";

/**
 * WebDavFileManager is a class that provides various methods for managing files and directories in a WebDAV server.
 * @implements {IWebDavFileManager}
 */
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

    /**
     * Asynchronously retrieves a list of directory files from the given path.
     *
     * @param {string} path - The path of the directory.
     * @returns {Promise<DirectoryFile[]>} - A promise that resolves to an array of DirectoryFile objects.
     */
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

    /**
     * Creates a directory at the specified path.
     *
     * @param {string} path - The path where the directory should be created.
     * @return {Promise<boolean>} - A promise that resolves to true if the directory was successfully created,
     *                             and false otherwise.
     */
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

    /**
     * Creates a new file at the specified path.
     *
     * @param {string} path - The path where the file will be created.
     * @returns {Promise<boolean>} - A promise that resolves to true if the file creation is successful, or false otherwise.
     */
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

    /**
     * Deletes an item from the specified path.
     *
     * @param {string} path - The path of the item to delete.
     * @returns {Promise<boolean>} - A Promise that resolves to true if the item is successfully deleted, or false otherwise.
     */
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

    /**
     * Renames a file or directory from the given path to the given target path.
     * Logs the process and handles any errors that occur during the rename operation.
     *
     * @param {string} path - The current path of the file or directory.
     * @param {string} toPath - The target path to rename the file or directory to.
     * @return {Promise<boolean>} A promise that resolves to true if the rename operation is successful, false otherwise.
     */
    public async renameItem(path: string, toPath: string): Promise<boolean> {
        try {
            await this.moveFile(path, toPath)
            this.setFileOperationSuccessfull(true);
            return true;
        } catch (error) {
            this.setFileOperationSuccessfull(false);
            return false;
        }
    }

    //TODO nice to have: moveFile should be supported with fullPath
    private async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
        const fullDestinationPath = `${destinationPath}`;
        const resp = await this.client.customRequest(sourcePath, {
            method: "MOVE",
            headers: {
                "Destination": fullDestinationPath
            }
        });

        if (resp.status >= 200 && resp.status < 300) {
            console.log(`Moved ${sourcePath} to ${destinationPath} successfully.`);
        } else {
            throw new Error(`Failed to move ${sourcePath} to ${destinationPath}. Status code: ${resp.status}`);
        }
    }

    public async moveItems(items: DirectoryFile[] | DirectoryFile, toPath: string | undefined): Promise<boolean> {
        if (!toPath) {
            throw new Error("Destination path is undefined");
        }

        try {
            if (Array.isArray(items)) {
                for (const item of items) {
                    const destination = `${toPath}/${getFileNameFromPath(item.filename)}`;
                    await this.moveFile(item.filename, destination);
                }
            } else {
                const destination = `${toPath}/${getFileNameFromPath(items.filename)}`;
                await this.moveFile(items.filename, destination);
            }
            return true;
        } catch (e) {
            console.error("Move operation failed!", e);
            return false;
        }
    }


    /**
     * Uploads a file to a remote path.
     *
     * @param {File} file - The file to be uploaded.
     * @param {string} remotePath - The remote path where the file will be uploaded to.
     *
     * @return {Promise<void>} - A promise that resolves when the file is successfully uploaded or rejects with an error if the upload fails.
     *
     * @throws {Error} - If there is an error reading the file or uploading the file.
     */
    public async uploadFile(file: File, remotePath: string): Promise<void> {
        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const arrayBuffer = reader.result;
                if (arrayBuffer instanceof ArrayBuffer) {
                    try {
                        await this.client.putFileContents(remotePath, arrayBuffer, {
                            overwrite: true,
                            headers: {
                                "Content-Type": file.type || "application/octet-stream",
                            }
                        });
                        console.log("File uploaded successfully");
                        this.setFileOperationSuccessfull(true);
                    } catch {
                        console.error("File uploaded wasn´t successfully")
                        this.setFileOperationSuccessfull(false);
                    }

                } else {
                    this.setFileOperationSuccessfull(false);
                    throw new Error("Failed to read file as ArrayBuffer");
                }
            };
            reader.onerror = () => {
                this.setFileOperationSuccessfull(false);
                throw new Error(`Error reading file: ${reader.error?.toString()}`);
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Error uploading file:", error);
            this.setFileOperationSuccessfull(false);
            throw error;
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
        for (const item of folders) {
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
                        if (folderZip != null) {
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


