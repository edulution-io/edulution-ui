// hooks/useWebDavActions.ts
import {useState} from "react";
import {WebDavFileManager} from "@/webdavclient/WebDavFileManager";
import {ContentType, DirectoryFile} from "../../datatypes/filesystem.ts";
import {useFileManagerStore} from "@/store/appDataStore.ts";


export const useWebDavActions = () => {
    const [files, setFiles] = useState<DirectoryFile[]>([]);
    const currentPath = useFileManagerStore((state) => state.currentPath)
    const setCurrentPath = useFileManagerStore((state) => state.setCurrentPath)
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

    const fetchDirectory = async (path: string = "/teachers/netzint-teacher"): Promise<DirectoryFile[]> => {
         try {
            const resp =  await webDavFileManager.getContentList(path);
            return resp.filter((item) => item.type == ContentType.directory)
        } catch (error) {
            console.error("Error fetching directory contents:", error);
            return []
        }
    }





    const handleWebDavAction = async (action: () => Promise<boolean>): Promise<boolean> => {
        return await action();
    };

    return { files, fetchDirectory,currentPath, fetchFiles, handleWebDavAction};
};
