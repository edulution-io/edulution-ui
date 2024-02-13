import {ColumnDef} from "@tanstack/react-table";
import {DirectoryFile} from "../../../datatypes/filesystem.ts";


export const columns: ColumnDef<DirectoryFile>[] = [
    {
        accessorKey: "filename",
        header: "filename",
    },
    {
        accessorKey: "lastmod",
        header: "lastmod",
    },
    {
        accessorKey: "size",
        header: "size",
    },
    {
        accessorKey: "type",
        header: "type",
    },
]