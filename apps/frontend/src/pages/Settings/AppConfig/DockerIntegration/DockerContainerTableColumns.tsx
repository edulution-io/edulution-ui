import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ContainerInfo } from 'dockerode';
import cn from '@libs/common/utils/className';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';

const DockerContainerTableColumns: ColumnDef<ContainerInfo>[] = [
  {
    id: 'state-badge',
    header: ({ table, column }) => (
      <SortableHeader<ContainerInfo, unknown>
        table={table}
        column={column}
        hidden
      />
    ),
    accessorFn: (row) => row.State,
    cell: ({ row }) => {
      const badgeClass = row.original.State === 'running' ? 'bg-green-500' : 'bg-red-500';

      return (
        <SelectableTextCell
          row={row}
          icon={<div className={cn('h-2 w-2 rounded-full', badgeClass)} />}
        />
      );
    },
  },
  {
    id: 'name',
    header: ({ column }) => (
      <SortableHeader<ContainerInfo, unknown>
        className="min-w-32"
        column={column}
      />
    ),

    meta: {
      translationId: 'dockerOverview.containerName',
    },

    accessorFn: (row) => row.Names[0],
    cell: ({ row }) => {
      const onClick = () => {};
      return (
        <SelectableTextCell
          onClick={onClick}
          text={row.original.Names[0].split('/')[1]}
          className="min-w-32"
        />
      );
    },
  },
  {
    id: 'container-image',
    header: ({ column }) => (
      <SortableHeader<ContainerInfo, unknown>
        className="min-w-32"
        column={column}
      />
    ),

    meta: {
      translationId: 'dockerOverview.imageName',
    },

    accessorFn: (row) => row.Image,
    cell: ({ row }) => {
      const onClick = () => {};
      return (
        <SelectableTextCell
          onClick={onClick}
          text={row.original.Image}
        />
      );
    },
  },
  {
    id: 'container-state',
    header: ({ column }) => (
      <SortableHeader<ContainerInfo, unknown>
        className="min-w-32"
        column={column}
      />
    ),

    meta: {
      translationId: 'dockerOverview.state',
    },

    accessorFn: (row) => row.State,
    cell: ({ row }) => {
      const onClick = () => {};
      return (
        <SelectableTextCell
          onClick={onClick}
          text={row.original.State}
        />
      );
    },
  },
  {
    id: 'container-status',
    header: ({ column }) => (
      <SortableHeader<ContainerInfo, unknown>
        className="min-w-32"
        column={column}
      />
    ),

    meta: {
      translationId: 'dockerOverview.status',
    },

    accessorFn: (row) => row.Status,
    cell: ({ row }) => {
      const onClick = () => {};
      return (
        <SelectableTextCell
          onClick={onClick}
          text={row.original.Status}
        />
      );
    },
  },
  {
    id: 'container-creation-date',
    header: ({ column }) => (
      <SortableHeader<ContainerInfo, unknown>
        className="min-w-32"
        column={column}
      />
    ),

    meta: {
      translationId: 'dockerOverview.created',
    },

    accessorFn: (row) => row.Created,
    cell: ({ row }) => {
      const onClick = () => {};
      const date = new Date(row.original.Created * 1000);

      return (
        <SelectableTextCell
          onClick={onClick}
          text={date.toLocaleString()}
        />
      );
    },
  },
];

export default DockerContainerTableColumns;
