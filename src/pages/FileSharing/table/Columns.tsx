import {ColumnDef} from "@tanstack/react-table";
import {ContentType, DirectoryFile} from "../../../../datatypes/filesystem.ts";
import {ArrowUpDown} from "lucide-react";
import {FaFileAlt, FaFolder} from "react-icons/fa";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    MdDriveFileRenameOutline,
    MdOutlineDeleteOutline,
    MdOutlineDriveFileMove,
    MdOutlineFileDownload,
} from "react-icons/md";
import {DeleteAlert} from "@/pages/FileSharing/alerts/DeleteAlert.tsx";
import {useFileManagerStore} from "@/store/appDataStore.ts";
import {RenameItemDialog} from "@/pages/FileSharing/dialog/RenameItemDialog.tsx";
import {ActionTooltip} from "@/pages/FileSharing/utilities/ActionTooltip.tsx";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import {MoveItemDialog} from "@/pages/FileSharing/dialog/MoveItemDialog.tsx";
import {WebDavFileManager} from "@/webdavclient/WebDavFileManager.ts";
import {useState} from "react";
import {LoadPopUp} from "@/components/shared/LoadPopUp.tsx";
import {formatBytes} from "@/utils/common.ts";
import {useWebDavActions} from "@/utils/webDavHooks.ts";


const filenameColumnWidth = "w-1/2";
const lastModColumnWidth = "w-1/3";
const sizeColumnWidth = "w-1/3";
const operationsColumnWidth = "w-1/12";

export const columns: ColumnDef<DirectoryFile>[] = [
    {
        id: 'select-filename',
        header: ({table, column}) => (
            <div className={`flex justify-between items-center ${filenameColumnWidth}`}>
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(value)}
                    aria-label="Select all"
                />
                <Button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    <div className="flex justify-between items-center">
                        File Name
                        <ArrowUpDown className="ml-2 h-4 w-4"/>
                    </div>
                </Button>
            </div>

        ),
        accessorFn: (row) => row.type + row.filename,

        cell: ({row}) => {
            const filename: string = row.original.filename;
            const formattedFilename = filename.split('/').pop();
            const Icon = filename.includes('.txt') ? FaFileAlt : FaFolder;
            const {fetchFiles} = useWebDavActions()
            const handleFilenameClick = (filename:string) => {
                fetchFiles(filename).catch((error) => console.log(error))
            };

            const handleCheckboxChange = () => {
                console.log('CheckBox was clicked');
                row.toggleSelected(!row.getIsSelected());
            };

            return (
                <div className="flex items-center">
                    <div className={`flex items-center ${filenameColumnWidth}`}>
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={handleCheckboxChange}
                            aria-label="Select row"
                        />
                        <Icon className="ml-2 mr-2"/>
                        <span className="text-left font-medium cursor-pointer"
                              onClick={() => {
                                  return handleFilenameClick(row.original.filename);}
                        }>{formattedFilename}</span>
                    </div>
                </div>
            );
        },

        enableHiding: false,
        sortingFn: (rowA, rowB) => {
            const valueA = rowA.original.type + rowA.original.filename;
            const valueB = rowB.original.type + rowB.original.filename;
            return valueA.localeCompare(valueB);
        },
    },
    {
        accessorKey: 'lastmod',
        header:
            ({column}) => (
                <Button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    <div className={`flex justify-between items-center ${lastModColumnWidth}`}>
                        Last Modified
                        <ArrowUpDown className="ml-2 h-4 w-4"/>
                    </div>
                </Button>
            ),
        cell: ({row}) => {
            const directoryFile = row.original as DirectoryFile;
            let formattedDate: string;

            if (directoryFile.lastmod) {
                const date = new Date(directoryFile.lastmod);
                formattedDate = !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';
            } else {
                formattedDate = 'Date not provided';  // fallback message or value
            }
            return (
                <div className={`flex items-center justify-center ${lastModColumnWidth}`}>
                    <span className="text-center font-medium">{formattedDate}</span>
                </div>
            );
        },
        sortingFn:
            (rowA, rowB, columnId) => {
                const dateA = new Date(rowA.original[columnId]);
                const dateB = new Date(rowB.original[columnId]);
                return dateA.getTime() - dateB.getTime();
            }
    }
    ,
    {
        accessorKey: "size",
        header: ({column}) => (
            <Button
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <div className={`flex justify-between items-center ${sizeColumnWidth}`}>
                    Size
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </div>
            </Button>
        ),
        cell: ({row}) => {
            let fileSize = 0
            if ((row.original).size != undefined) {
                fileSize = (row.original).size;
            }
            return (
                <div className={`flex flex-row  ${sizeColumnWidth}`}>
                    <p className="text-right font-medium">{formatBytes(fileSize)}</p>
                </div>
            );
        }
    },

    {
        accessorKey: "delete",
        header:
            () => (
                <div className={`flex justify-between items-center ${operationsColumnWidth}`}>
                    <p></p>
                </div>
            ),
        cell:
            ({row}) => {
                const selectedItems: DirectoryFile[] = useFileManagerStore(state => state.selectedItems);
                const webDavFileManager = new WebDavFileManager();
                const [showLoadingPopUp, setShowLoadingPopUp] = useState<boolean>(false);
                const handleDownload = async (item: DirectoryFile) => {
                    setShowLoadingPopUp(true);
                    try {
                        await webDavFileManager.triggerFolderDownload(item.filename);
                    } catch (error) {
                        console.error("Download failed:", error);
                    } finally {
                        setShowLoadingPopUp(false);
                    }
                };
                return (
                    selectedItems.length == 0 && (
                        <TooltipProvider>
                            <div>
                                {showLoadingPopUp && (
                                    <LoadPopUp isOpen={showLoadingPopUp}/>
                                )}
                            </div>
                            <div className={`flex items-center justify-end`}>
                                <div className={`flex items-center justify-end ${operationsColumnWidth}`}>
                                    <ActionTooltip
                                        onAction={() => console.log("HHH")}
                                        tooltipText="Add File"
                                        trigger={<RenameItemDialog
                                            trigger={<MdDriveFileRenameOutline/>}
                                            item={(row.original as DirectoryFile)}
                                        />}
                                    />
                                </div>
                                <div className={`flex items-center justify-end ${operationsColumnWidth}`}>
                                    <ActionTooltip
                                        onAction={() => console.log("HHH")}
                                        tooltipText="Add File"
                                        trigger={<MoveItemDialog trigger={<MdOutlineDriveFileMove/>}
                                                                 item={(row.original as DirectoryFile)}></MoveItemDialog>}
                                    >
                                    </ActionTooltip>
                                </div>
                                <div className={`flex items-center justify-end ${operationsColumnWidth}`}>
                                    <ActionTooltip
                                        onAction={() => {
                                            if ((row.original as DirectoryFile).type == ContentType.file) {
                                                webDavFileManager.triggerFileDownload((row.original as DirectoryFile).filename).catch((error) => console.log(error))
                                            } else {
                                                handleDownload((row.original as DirectoryFile)).catch((error) => console.log(error))
                                            }
                                        }}
                                        tooltipText="Add File"
                                        trigger={<MdOutlineFileDownload/>}
                                    >
                                    </ActionTooltip>
                                </div>
                                <div className={`flex items-center justify-end ${operationsColumnWidth}`}>
                                    <ActionTooltip
                                        onAction={() => console.log("HHH")}
                                        tooltipText="Add File"
                                        trigger={<DeleteAlert trigger={<MdOutlineDeleteOutline/>}
                                                              file={[(row.original as DirectoryFile)]}></DeleteAlert>}
                                    >
                                    </ActionTooltip>
                                </div>
                            </div>
                        </TooltipProvider>

                    )
                )
            }
    }
]