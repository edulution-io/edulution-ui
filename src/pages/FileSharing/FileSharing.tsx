import {MenubarSeparator, MenubarTrigger, VerticalMenubar} from "@/components/ui/menubar.tsx";
import {MenubarMenu} from "@radix-ui/react-menubar";
import Icon from "@/components/ui/Icon.tsx";
import {DataTable} from "@/pages/FileSharing/table/DataTable.tsx";
import {columns} from "@/pages/FileSharing/table/Columns.tsx";
import {useEffect, useState} from "react";
import {ContentType, DirectoryFile} from "../../../datatypes/filesystem.ts";
import {WebDavFileManager} from "@/webdavclient/WebDavFileManager.ts";
import {MdOutlineDeleteOutline, MdOutlineDriveFileMove, MdOutlineNoteAdd} from "react-icons/md";
import {FiUpload} from "react-icons/fi";
import {HiOutlineFolderAdd} from "react-icons/hi";
import {CreateNewContentDialog} from "@/pages/FileSharing/dialog/CreateNewContentDialog.tsx";
import {DirectoryBreadcrumb} from "@/pages/FileSharing/DirectoryBreadcrumb.tsx";
import {MainLayout} from "@/components/layout/MainLayout.tsx";
import {DeleteAlert} from "@/pages/FileSharing/alerts/DeleteAlert.tsx";
import {useFileManagerStore} from "@/store/appDataStore.ts";
import {StatusAlert} from "@/pages/FileSharing/alerts/StatusAlert.tsx";
import {TooltipProvider} from "@radix-ui/react-tooltip";
import {ActionTooltip} from "@/pages/FileSharing/utilities/ActionTooltip.tsx";

export const FileSharing = () => {
    const webDavFileManager = new WebDavFileManager();
    const [files, setFiles] = useState<DirectoryFile[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('');
    const [isSuccessfull, setIsSuccessfull] = useState<boolean>(false);
    const [showPopUp, setShowPopUp] = useState<boolean>(false);
    const selectedItems: DirectoryFile[] = useFileManagerStore(state => state.selectedItems);
    const fetchFiles = async (path: string) => {
        try {
            const directoryFiles = await webDavFileManager.getContentList(path);
            setCurrentPath(path)
            setFiles(directoryFiles);
        } catch (error) {
            console.error("Error fetching directory contents:", error);
        }
    };

    const handleWebDavAction = async (action: () => Promise<boolean>) => {
        try {
            const isSuccess = await action();
            setIsSuccessfull(isSuccess);
            setShowPopUp(true);
            setTimeout(() => setShowPopUp(false), 5000);
            if (isSuccess) {
                await fetchFiles(currentPath);
            }
        } catch (error) {
            console.error(error);
            setIsSuccessfull(false);
            setShowPopUp(true);
            setTimeout(() => setShowPopUp(false), 5000);
        }
    };

    const createDirectory = (path: string) => handleWebDavAction(() => webDavFileManager.createDirectory(path));
    const createFile = (path: string) => handleWebDavAction(() => webDavFileManager.createFile(path));

    const uploadItem = (path: string): Promise<void> => {
        console.log("Upload to" + path)
    }

    const handleRowClick = (row: DirectoryFile) => {
        fetchFiles(row.filename).catch((error: string) => console.log("Error" + error))
    };


    useEffect(() => {
        fetchFiles("/teachers/netzint-teacher").catch((error: string) => console.log("Error" + error))
    }, []);

    return (
        <MainLayout>
            <>
                <div>
                    {showPopUp &&
                        <StatusAlert success={isSuccessfull}></StatusAlert>
                    }
                </div>
                <div className="flex flex-col md:flex-row">
                    <div className="flex-shrink-0 py-10">
                        <VerticalMenubar>
                            <div className="flex  justify-center items-center  w-full h-full">
                                <div className="flex-row">
                                    <Icon.SideBarImageIcon src="src/assets/icons/filesharing-light.svg" alt="Home"/>
                                    <p className="font-bold text-white">File Sharing</p>
                                </div>
                            </div>
                            <div className="text-white font-bold">
                                <MenubarMenu>
                                    <MenubarSeparator></MenubarSeparator>
                                    <MenubarTrigger
                                        icon={<Icon.ItemImageIcon
                                            src={"src/assets/icons/buildings-light.svg"}/>}>Home</MenubarTrigger>
                                    <MenubarSeparator></MenubarSeparator>
                                    <MenubarTrigger
                                        icon={<Icon.ItemImageIcon
                                            src={"src/assets/icons/buildings-light.svg"}/>}>Programs</MenubarTrigger>
                                    <MenubarSeparator></MenubarSeparator>
                                    <MenubarTrigger
                                        icon={<Icon.ItemImageIcon
                                            src={"src/assets/icons/buildings-light.svg"}/>}>Share</MenubarTrigger>
                                    <MenubarSeparator></MenubarSeparator>
                                    <MenubarTrigger
                                        icon={<Icon.ItemImageIcon
                                            src={"src/assets/icons/buildings-light.svg"}/>}>Students</MenubarTrigger>
                                </MenubarMenu>
                            </div>
                        </VerticalMenubar>
                    </div>
                    <div className="flex-1 container mx-auto py-10">

                        <div className="flex justify-between pt-3 pb-3">
                            <TooltipProvider>
                                <div className="flex flex-col ">
                                    <div className="flex space-x-2">
                                        <p className="text-white mr-2">Current Directory:</p>
                                        <DirectoryBreadcrumb path={currentPath} onNavigate={fetchFiles}/>
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    {selectedItems.length == 0 && (
                                        <>
                                            <ActionTooltip
                                                onAction={() => console.log("Add File Clicked")}
                                                tooltipText="Add File"
                                                trigger={<CreateNewContentDialog
                                                        trigger={<MdOutlineNoteAdd className="text-green-700"
                                                                                     onClick={() => console.log("HALLO")}/>}
                                                        createContent={(path: string) => createFile(currentPath + "/" + path)}
                                                        contentType={ContentType.file}/>}
                                            />
                                             <ActionTooltip
                                                onAction={() => console.log("Add Folder Clicked")}
                                                tooltipText="Add Folder"
                                                trigger={<CreateNewContentDialog
                                                        trigger={<HiOutlineFolderAdd className="text-green-700"
                                                                                     onClick={() => console.log("HALLO")}/>}
                                                        createContent={(path: string) => createDirectory(currentPath + "/" + path)}
                                                        contentType={ContentType.directory}/>}
                                            />
                                            <ActionTooltip
                                                onAction={() => console.log("Upload item Clicked")}
                                                tooltipText="Upload item"
                                                trigger={<CreateNewContentDialog
                                                        trigger={<FiUpload className="text-green-700"
                                                                                     onClick={() => console.log("Wanna Upload")}/>}
                                                        createContent={(path: string) => uploadItem(currentPath + "/" + path)}
                                                        contentType={ContentType.directory}/>}
                                            />
                                        </>
                                    )}
                                    {selectedItems.length > 0 && (
                                        <>
                                            <ActionTooltip
                                                onAction={() => console.log("Upload item Clicked")}
                                                tooltipText="Upload item"
                                                trigger={<DeleteAlert
                                                        trigger={<MdOutlineDriveFileMove className="text-green-700"
                                                                                     onClick={() => console.log("Wanna Upload")}/>}
                                                        />}
                                            />

                                            <ActionTooltip
                                                onAction={() => console.log("Upload item Clicked")}
                                                tooltipText="Upload item"
                                                trigger={<DeleteAlert
                                                        trigger={<MdOutlineDeleteOutline className="text-green-700"
                                                                                     onClick={() => console.log("Wanna Upload")}/>}
                                                        />}

                                            />
                                        </>
                                    )}
                                </div>
                            </TooltipProvider>
                        </div>
                        <DataTable columns={columns} data={files} onRowClick={handleRowClick}/>
                    </div>
                </div>
            </>
        </MainLayout>
    )
}