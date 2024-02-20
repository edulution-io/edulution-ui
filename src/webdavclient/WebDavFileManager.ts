import {IWebDavFileManager} from "./IWebDavFileManager.ts";

import {createClient, WebDAVClient} from "webdav";
import {DirectoryFile} from "../../datatypes/filesystem.ts";
import {useFileManagerStore} from "@/store/appDataStore.ts";

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


}


