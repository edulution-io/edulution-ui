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
import React, {useState} from "react";
import {LoadPopUp} from "@/components/shared/LoadPopUp.tsx";

export const columns: ColumnDef<DirectoryFile>[] = [
    {
        id: 'select-filename',
        enableSorting: false,
        header: ({table}) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({row}) => {
            const filename: string = row.original.filename;
            const formatted = filename.split('/').pop();
            const Icon = filename.includes('.txt') ? FaFileAlt : FaFolder;

            const handleCheckboxChange = () => {
                console.log('CheckBox was clicked');
                row.toggleSelected(!row.getIsSelected());
            };

            const handleRowClick = () => {
                console.log('Filename was clicked');
            };

            return (
                <div className="flex items-center cursor-pointer" onClick={handleRowClick}>
                    <div onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={handleCheckboxChange}
                            onCheckboxClick={(e) => e.stopPropagation()}
                            aria-label="Select row"
                        />
                    </div>
                    <Icon className="ml-2"/>
                    <div className="text-left font-medium ml-2">{formatted}</div>
                </div>
            );
        },
        enableHiding: false,
    },
    {
        accessorKey: 'lastmod',
        header:
            ({column}) => (
                <Button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    <div className="flex justify-between items-center">
                        Last Modified
                        <ArrowUpDown className="ml-2 h-4 w-4"/>
                    </div>
                </Button>
            ),
        cell:
            ({
                 row
             }) => {
                const lastModValue: string = row.getValue('lastmod');
                const date = new Date(lastModValue);
                if (!isNaN(date.getTime())) {
                    return <div className="text-left font-medium">{date.toLocaleDateString()}</div>;
                } else {
                    return <div className="text-left font-medium">Invalid Date</div>;
                }
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
        header:
            ({column}) => {
                return (
                    <Button
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <div className="flex justify-between items-center">
                            Size
                            <ArrowUpDown className="ml-2 h-4 w-4"/>
                        </div>
                    </Button>
                )
            },
    },

    {
        accessorKey: "delete",
        header:
            () => {
                return (
                    <div></div>
                )
            },
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

                            <div className="flex justify-end space-x-4">
                                <ActionTooltip
                                    onAction={() => console.log("HHH")}
                                    tooltipText="Add File"
                                    trigger={<RenameItemDialog
                                        trigger={<MdDriveFileRenameOutline/>}
                                        item={(row.original as DirectoryFile)}
                                    />}
                                />
                                <ActionTooltip
                                    onAction={() => console.log("HHH")}
                                    tooltipText="Add File"
                                    trigger={<MoveItemDialog trigger={<MdOutlineDriveFileMove/>}
                                                             item={(row.original as DirectoryFile)}></MoveItemDialog>}
                                >
                                </ActionTooltip>
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
                                <ActionTooltip
                                    onAction={() => console.log("HHH")}
                                    tooltipText="Add File"
                                    trigger={<DeleteAlert trigger={<MdOutlineDeleteOutline/>}
                                                          file={[(row.original as DirectoryFile)]}></DeleteAlert>}
                                >
                                </ActionTooltip>
                            </div>
                        </TooltipProvider>
                    )
                )
            }
    }
]