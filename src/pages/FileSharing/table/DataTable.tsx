"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    OnChangeFn,
    RowSelectionState,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {DirectoryFile} from "../../../../datatypes/filesystem.ts";
import {useEffect, useState} from "react";
import {useFileManagerStore} from "@/store/appDataStore.ts";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";

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
    const setSelectedItems = useFileManagerStore((state) => state.setSelectedItems);

    const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
        const newValue = typeof updaterOrValue === 'function'
            ? updaterOrValue(useFileManagerStore.getState().selectedRows)
            : updaterOrValue;
        useFileManagerStore.getState().setSelectedRows(newValue);
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onRowSelectionChange: handleRowSelectionChange,
        state: {
            sorting,
            rowSelection: useFileManagerStore((state) => state.selectedRows),
        },
    })

    useEffect(() => {
        const selectedItemFilenames = table.getFilteredSelectedRowModel().rows.map(row => {
            return (row.original as DirectoryFile);
        });
        setSelectedItems(selectedItemFilenames);
    }, [table.getFilteredSelectedRowModel().rows]);

    return (
        <div>
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div className="flex-1 text-sm text-muted-foreground text-white">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
            )}


        <div className="flex flex-col w-full">
            <Table className="w-full">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                         <TableRow key={headerGroup.id} className=" text-white">
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
            </Table>
            {/* ScrollArea wraps only the TableBody */}
            <ScrollArea className="w-full max-h-[600px] overflow-auto">
                <Table className="w-full min-w-full">
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
            </ScrollArea>
        </div>
        </div>

    )
}
