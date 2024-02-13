import IWebDavClient from "./IWebDavClient";

import {createClient, WebDAVClient} from "webdav";
import {DirectoryFile} from "../../datatypes/filesystem.ts";


class WebDavClientProxy implements IWebDavClient {
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

  public getAllFilesAndDirectories = async (path: string): Promise<DirectoryFile[]> => {
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
          console.log(path)
          return result.data as DirectoryFile[];
      } else {
          console.log(path)
          return result as DirectoryFile[];
      }
  }
}

export default WebDavClientProxy;
