import {MenubarSeparator, MenubarTrigger, VerticalMenubar} from "@/components/ui/menubar.tsx";
import MainLayout from "@/components/layout/MainLayout.tsx";
import {MenubarMenu} from "@radix-ui/react-menubar";
import Icon from "@/components/ui/Icon.tsx";
import {DataTable} from "@/pages/FileSharing/data-table.tsx";
import {columns} from "@/pages/FileSharing/columns.tsx";
import {useEffect, useState} from "react";
import {ContentType, DirectoryFile} from "../../../datatypes/filesystem.ts";
import {WebDavFileManager} from "@/webdavclient/WebDavFileManager.ts";
import {MdOutlineDeleteOutline, MdOutlineNoteAdd} from "react-icons/md";
import {FiUpload} from "react-icons/fi";
import {HiOutlineFolderAdd} from "react-icons/hi";
import {TooltipContent, TooltipProvider, TooltipTrigger} from "@radix-ui/react-tooltip";
import {Tooltip} from "@/components/ui/tooltip.tsx";
import {CreateNewContentDialog} from "@/pages/FileSharing/CreateNewContentDialog.tsx";
import {DirectoryBreadcrumb} from "@/pages/FileSharing/DirectoryBreadcrumb.tsx";
import StatusAlert from "@/pages/FileSharing/StatusAlert.tsx";

const FileSharing = () => {
    const webDavFileManager = new WebDavFileManager();
    const [files, setFiles] = useState<DirectoryFile[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('');
    const [isSuccessfull, setIsSuccessfull] = useState<boolean>(false);
    const [showPopUp, setShowPopUp] = useState<boolean>(false);
    const fetchFiles = async (path: string) => {
        try {
            const directoryFiles = await webDavFileManager.getContentList(path);
            setCurrentPath(path)
            console.log(directoryFiles)
            setFiles(directoryFiles);
        } catch (error) {
            console.error("Error fetching directory contents:", error);
        }
    };

    const createDirectory = async (path: string): Promise<void> => {
        await webDavFileManager.createDirectory(path).then(() => {
            setIsSuccessfull(true)

        }).catch(() => {
             setIsSuccessfull(false)
         });
        setTimeout(() => setShowPopUp(false), 5000);
        setShowPopUp(true)
        fetchFiles(currentPath).catch((error) => console.error(error))
    }


    const createFile = async (path: string): Promise<void> => {
         await webDavFileManager.createFile(path).then(() => {
             setIsSuccessfull(true)
         }).catch(() => {
             setIsSuccessfull(false)
         });
        setTimeout(() => setShowPopUp(false), 5000);
        setShowPopUp(true)
        fetchFiles(currentPath).catch((error) => console.error(error))
    }

    const handleRowClick = (row: DirectoryFile) => {
        fetchFiles(row.filename).catch((error: string) => console.log("Error" + error))
    };


    useEffect(() => {
        fetchFiles("/teachers/netzint-teacher").catch((error: string) => console.log("Error" + error))
    }, []);

    return (
        <MainLayout>
            <div>
                {showPopUp &&
                    <StatusAlert success={isSuccessfull}></StatusAlert>
                }
            </div>
            <div className="flex flex-col md:flex-row">
                <div className="flex-shrink-0">
                    <VerticalMenubar>
                        <div className="flex  justify-center items-center  w-full h-full">
                            <div className="flex-row">
                                <Icon.SideBarImageIcon src="src/assets/icons/House.png" alt="Home"/>
                                <p className="font-bold text-white">File Sharing</p>
                            </div>
                        </div>
                        <div className="text-white font-bold">
                            <MenubarMenu>
                                <MenubarSeparator></MenubarSeparator>
                                <MenubarTrigger
                                    icon={<Icon.ItemImageIcon
                                        src={"src/assets/icons/House.png"}/>}>Home</MenubarTrigger>
                                <MenubarSeparator></MenubarSeparator>
                                <MenubarTrigger
                                    icon={<Icon.ItemImageIcon
                                        src={"src/assets/icons/House.png"}/>}>Programs</MenubarTrigger>
                                <MenubarSeparator></MenubarSeparator>
                                <MenubarTrigger
                                    icon={<Icon.ItemImageIcon
                                        src={"src/assets/icons/House.png"}/>}>Share</MenubarTrigger>
                                <MenubarSeparator></MenubarSeparator>
                                <MenubarTrigger
                                    icon={<Icon.ItemImageIcon
                                        src={"src/assets/icons/House.png"}/>}>Students</MenubarTrigger>
                            </MenubarMenu>
                        </div>
                    </VerticalMenubar>
                </div>
                <div className="flex-1 container mx-auto py-10">
                    <div className="flex justify-between pt-3 pb-3">
                        <TooltipProvider>
                            <div className="flex space-x-4">
                                <div className="flex">
                                    <p className="text-white mr-2">Current Directory:</p>
                                    <DirectoryBreadcrumb path={currentPath} onNavigate={fetchFiles}/>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <Tooltip>
                                    <TooltipTrigger>
                                        {<CreateNewContentDialog
                                            trigger={<MdOutlineNoteAdd className="text-green-700"
                                                                       onClick={() => console.log("HALLO")}/>}
                                            createContent={(path: string) => createFile(currentPath + "/" + path)}
                                            contentType={ContentType.file}
                                        />}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Add File</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger>
                                        {<CreateNewContentDialog
                                            trigger={<HiOutlineFolderAdd className="text-green-700"
                                                                         onClick={() => console.log("HALLO")}/>}
                                            createContent={(path: string) => createDirectory(currentPath + "/" + path)}
                                            contentType={ContentType.directory}
                                        />}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Forwards</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <FiUpload className="text-green-700"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Backwards</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <MdOutlineDeleteOutline className="text-green-700"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Backwards</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </TooltipProvider>
                    </div>
                    <DataTable columns={columns} data={files} onRowClick={handleRowClick}/>
                </div>
            </div>
        </MainLayout>
    )
}

export default FileSharing;