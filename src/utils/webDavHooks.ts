// hooks/useWebDavActions.ts
import {useState} from "react";
import {WebDavFileManager} from "@/webdavclient/WebDavFileManager";
import {DirectoryFile} from "../../datatypes/filesystem.ts";

export const useWebDavActions = (initialPath: string = "/") => {
    const [files, setFiles] = useState<DirectoryFile[]>([]);
    const [currentPath, setCurrentPath] = useState<string>(initialPath);
    const webDavFileManager = new WebDavFileManager();

    const fetchFiles = async (path: string = currentPath): Promise<void> => {
        try {
            const directoryFiles = await webDavFileManager.getContentList(path);
            setCurrentPath(path);
            setFiles(directoryFiles);
        } catch (error) {
            console.error("Error fetching directory contents:", error);

        }
    };

    const handleWebDavAction = async (action: () => Promise<boolean>): Promise<boolean> => {
        return await action();
    };

    return { files, currentPath, fetchFiles, handleWebDavAction };
};
