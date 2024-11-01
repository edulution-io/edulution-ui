import React, { useEffect, useState } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const FileSharingTable = <TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const setSelectedItems = useFileSharingStore((state) => state.setSelectedItems);
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(useFileSharingStore.getState().selectedRows)
        : updaterOrValue;
    useFileSharingStore.getState().setSelectedRows(newValue);
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
      rowSelection: useFileSharingStore((state) => state.selectedRows),
    },
  });

  useEffect(() => {
    const selectedItemFilenames = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original as DirectoryFileDTO);
    setSelectedItems(selectedItemFilenames);
  }, [table.getFilteredSelectedRowModel().rows]);

  return (
    <ScrollableTable
      columns={columns}
      data={data}
    />
  );
};

export default FileSharingTable;
