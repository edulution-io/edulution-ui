// hooks/useWebDavActions.ts
import {useState} from "react";
import {WebDavFileManager} from "@/webdavclient/WebDavFileManager";
import {DirectoryFile} from "../../datatypes/filesystem.ts";
import {useFileManagerStore} from "@/store/appDataStore.ts";

export const useWebDavActions = () => {
    const [files, setFiles] = useState<DirectoryFile[]>([]);
    const currentPath = useFileManagerStore((state) => state.currentPath)
    const setCurrentPath = useFileManagerStore((state) => state.setCurrentPath)
    const webDavFileManager = new WebDavFileManager();

    const fetchFiles = async (path: string = currentPath): Promise<void> => {
        try {
            const directoryFiles = await webDavFileManager.getContentList(path);
            console.log(path)
            setCurrentPath(path);
            console.log(currentPath)
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
