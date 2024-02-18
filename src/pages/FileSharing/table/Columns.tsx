import {ColumnDef} from "@tanstack/react-table";
import {DirectoryFile} from "../../../../datatypes/filesystem.ts";
import {ArrowUpDown} from "lucide-react";
import {FaFileAlt, FaFolder} from "react-icons/fa";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Button} from "@/components/ui/button.tsx";
import {MdDriveFileRenameOutline, MdOutlineDeleteOutline, MdOutlineDriveFileMove} from "react-icons/md";
import {DeleteAlert} from "@/pages/FileSharing/alerts/DeleteAlert.tsx";
import {useFileManagerStore} from "@/store/appDataStore.ts";

export const columns: ColumnDef<DirectoryFile>[] = [
    {
        id: "select",
        header: ({table}) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({row}) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "type",
        header:
            ({column}) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Type
                        <ArrowUpDown className="ml-2 h-4 w-4"/>
                    </Button>
                )
            },
        cell:
            ({row}) => {
                const type: string = row.getValue("type")
                return type === "file" ? <FaFileAlt/> : <FaFolder/>
            },
    },
    {
        accessorKey: "filename",
        header:
            ({column}) => {
                return (
                    <Button
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        File Name
                        <ArrowUpDown className="ml-2 h-4 w-4"/>
                    </Button>
                )
            },
        cell:
            ({row}) => {
                const filename: string = row.getValue("filename")
                const formatted = filename.split("/").pop()
                return <div className="text-left font-medium">{formatted}</div>
            },
    }
    ,
    {
        accessorKey: 'lastmod',
        header:
            ({column}) => (
                <Button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Last Modified
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            ),
        cell:
            ({row}) => {
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
                        Size
                        <ArrowUpDown className="ml-2 h-4 w-4"/>
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
                return (
                    selectedItems.length == 0 && (
                        <div className="flex justify-end">
                            <Button>
                                <DeleteAlert trigger={<MdDriveFileRenameOutline/>} files={[(row.original as DirectoryFile)]}></DeleteAlert>
                            </Button>
                            <Button>
                                <DeleteAlert trigger={<MdOutlineDriveFileMove/>} files={[(row.original as DirectoryFile)]}></DeleteAlert>
                            </Button>
                            <Button>
                                <DeleteAlert trigger={<MdOutlineDeleteOutline/>} files={[(row.original as DirectoryFile)]}></DeleteAlert>
                            </Button>
                        </div>
                    )
                )
            }
    }
]