import {MenubarSeparator, MenubarTrigger, VerticalMenubar} from "@/components/ui/menubar.tsx";
import {MenubarMenu} from "@radix-ui/react-menubar";
import Icon from "@/components/ui/Icon.tsx";
import {DataTable} from "@/pages/FileSharing/table/DataTable.tsx";
import {columns} from "@/pages/FileSharing/table/Columns.tsx";
import {useEffect, useState} from "react";
import {ContentType, DirectoryFile} from "../../../datatypes/filesystem.ts";
import {MdOutlineDeleteOutline, MdOutlineDriveFileMove, MdOutlineFileDownload, MdOutlineNoteAdd} from "react-icons/md";
import {FiUpload} from "react-icons/fi";
import {HiOutlineFolderAdd} from "react-icons/hi";
import {CreateNewContentDialog} from "@/pages/FileSharing/dialog/CreateNewContentDialog.tsx";
import {DirectoryBreadcrumb} from "@/pages/FileSharing/DirectoryBreadcrumb.tsx";
import {MainLayout} from "@/components/layout/MainLayout.tsx";
import {DeleteAlert} from "@/pages/FileSharing/alerts/DeleteAlert.tsx";
import {useFileManagerStore} from "@/store/appDataStore.ts";
import {TooltipProvider} from "@radix-ui/react-tooltip";
import {ActionTooltip} from "@/pages/FileSharing/utilities/ActionTooltip.tsx";
import {useWebDavActions} from "@/utils/webDavHooks.ts";
import {StatusAlert} from "@/pages/FileSharing/alerts/StatusAlert.tsx";
import {MoveItemDialog} from "@/pages/FileSharing/dialog/MoveItemDialog.tsx";
import {WebDavFileManager} from "@/webdavclient/WebDavFileManager.ts";
import {LoadPopUp} from "@/components/shared/LoadPopUp.tsx";
import {UploadItemDialog} from "@/pages/FileSharing/dialog/UploadItemDialog.tsx";

export const FileSharing = () => {
    const {files, currentPath, fetchFiles, fetchMountPoints} = useWebDavActions();
    const [mountPoints, setMountPoints] = useState<DirectoryFile[]>([])
    const selectedItems: DirectoryFile[] = useFileManagerStore(state => state.selectedItems);
    const fileOperationSuccessful: boolean = useFileManagerStore(state => state.fileOperationSuccessful);
    const setFileOperationSuccessful: (fileOperationSuccessful: boolean | undefined) => void = useFileManagerStore(state => state.setFileOperationSuccessful);
    const [showPopUp, setShowPopUp] = useState<boolean>(false);
    const [showLoadingPopUp, setShowLoadingPopUp] = useState<boolean>(false);
    const webDavFileManager = new WebDavFileManager()

    useEffect(() => {
        fetchFiles().catch(console.error);
        fetchMountPoints().then((result) => {
            setMountPoints(result)
        })
        console.log(mountPoints)
    }, []);


    const handleDownload = async (items: DirectoryFile[]) => {
        setShowLoadingPopUp(true);
        try {
            await webDavFileManager.triggerMultipleFolderDownload(items);
        } catch (error) {
            console.error("Download failed:", error);
        } finally {
            setShowLoadingPopUp(false);
        }
    };


    useEffect(() => {
        if (fileOperationSuccessful !== undefined) {
            setShowPopUp(true);
            fetchFiles().catch(console.error);
            const timer = setTimeout(() => {
                setShowPopUp(false);
            }, 3000);
            const resetTimer = setTimeout(() => {
                setFileOperationSuccessful(undefined);
            }, 3500);

            return () => {
                clearTimeout(timer);
                clearTimeout(resetTimer);
            };
        }
    }, [fileOperationSuccessful, setFileOperationSuccessful]);


    const handleRowClick = (row: DirectoryFile) => {
        fetchFiles(row.filename).catch((error: string) => console.log("Error" + error))
    };


    return (
        <MainLayout>
            <>
                <div>
                    {showLoadingPopUp && (
                        <LoadPopUp isOpen={showLoadingPopUp}/>
                    )}
                    {showPopUp &&
                        <StatusAlert success={fileOperationSuccessful}></StatusAlert>
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
                                                    contentType={ContentType.file}/>}
                                            />
                                            <ActionTooltip
                                                onAction={() => console.log("Add Folder Clicked")}
                                                tooltipText="Add Folder"
                                                trigger={<CreateNewContentDialog
                                                    trigger={<HiOutlineFolderAdd className="text-green-700"
                                                                                 onClick={() => console.log("HALLO")}/>}

                                                    contentType={ContentType.directory}/>
                                                }
                                            />
                                            <ActionTooltip
                                                onAction={() => console.log("Upload item Clicked")}
                                                tooltipText="Upload item"
                                                trigger={<UploadItemDialog
                                                    trigger={<FiUpload className="text-green-700"
                                                                       onClick={() => console.log("Wanna Upload")}/>}
                                                    />}
                                            />
                                        </>
                                    )}
                                    {selectedItems.length > 0 && (
                                        <>
                                            <ActionTooltip
                                                onAction={() => console.log("Upload item Clicked")}
                                                tooltipText="Upload item"
                                                trigger={<MoveItemDialog
                                                    trigger={<MdOutlineDriveFileMove className="text-green-700"
                                                                                     onClick={() => console.log("Wanna Upload")}/>}
                                                    item={selectedItems}
                                                />}
                                            />

                                            <ActionTooltip
                                                onAction={() => console.log("Upload item Clicked")}
                                                tooltipText="Upload item"
                                                trigger={<DeleteAlert
                                                    trigger={<MdOutlineDeleteOutline className="text-green-700"
                                                                                     onClick={() => console.log("Wanna Upload")}/>}
                                                    file={selectedItems}
                                                />}
                                            />
                                            <ActionTooltip
                                                onAction={() => handleDownload(selectedItems)}
                                                tooltipText="Download Selected Items"
                                                trigger={<MdOutlineFileDownload className="text-green-700"/>}
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