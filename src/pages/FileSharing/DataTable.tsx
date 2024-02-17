"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {DirectoryFile} from "../../../datatypes/filesystem.ts";
import {useEffect, useState} from "react";

const shouldApplyClickHandler = (rowId: string): boolean => {
    return rowId.includes("filename")
};

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]

    onRowClick(row: DirectoryFile): void
}


export function DataTable<TData, TValue>({columns, data, onRowClick}: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] = useState<SortingState>([])
    const [rowSelection, setRowSelection] = useState({})
    const [selectedItems, setSelectedItems] = useState<DirectoryFile[]>([]);


    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            rowSelection,
        },
    })

    useEffect(() => {
        const selectedItemFilenames = table.getFilteredSelectedRowModel().rows.map(row => {
            return (row.original as DirectoryFile);
        });
        setSelectedItems(selectedItemFilenames);
    }, [table.getFilteredSelectedRowModel().rows]);


    useEffect(() => {
        console.log(selectedItems);
    }, [selectedItems]);

    return (
        <div>
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div className="flex-1 text-sm text-muted-foreground text-white">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredSelectedRowModel().rows.map((a) =>
                        <p>{(a.original as DirectoryFile).filename}</p>)}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
            )}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="text-green-700">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}
                                                   onClick={() => shouldApplyClickHandler(cell.id) && onRowClick(row.original as DirectoryFile)}
                                                   className={`cursor-pointer text-white ${shouldApplyClickHandler(cell.id) ? '' : 'cursor-default'}`}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
