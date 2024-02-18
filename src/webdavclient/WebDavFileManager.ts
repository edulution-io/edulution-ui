import {IWebDavFileManager} from "./IWebDavFileManager.ts";

import {createClient, WebDAVClient} from "webdav";
import {DirectoryFile} from "../../datatypes/filesystem.ts";

export class WebDavFileManager implements IWebDavFileManager {
    private client: WebDAVClient;

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
        try{
            await this.client.createDirectory(path);
            return true
        }catch (e){
            console.error("Creation failed!")
            return false
        }

    }

    public async createFile(path: string): Promise<boolean> {
        try{
            return await this.client.putFileContents(path, " ");
        }catch (e){
            console.error("Creation failed!")
            return false
        }
    }

    public async deleteItem(path: string): Promise<boolean> {
        try{
            await this.client.deleteFile(path)
            return true
        }catch (e){
            console.error("Creation failed!")
            return false
        }
    }

    public async moveItem(path: string, toPath: string): Promise<boolean>{
          try{
            await this.client.copyFile(path, toPath)
            return true
        }catch (e){
            console.error("Creation failed!")
            return false
        }
    }


}


