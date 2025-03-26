/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { ContainerInfo } from 'dockerode';
import i18n from '@/i18n';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import ActionTooltip from '@/components/shared/ActionTooltip';
import cn from '@libs/common/utils/className';
import DOCKER_STATES from '@libs/docker/constants/dockerStates';
import { useLocation } from 'react-router-dom';
import APPS from '@libs/appconfig/constants/apps';
import DOCKER_CONTAINER_TABLE_COLUMNS from '@libs/docker/constants/dockerContainerTableColumns';

const DockerContainerTableColumns: ColumnDef<ContainerInfo>[] = [
  {
    id: DOCKER_CONTAINER_TABLE_COLUMNS.STATE_BADGE,
    header: ({ table, column }) => {
      const { pathname } = useLocation();
      const isDockerOverview = pathname === `/${APPS.SETTINGS}`;

      return (
        <SortableHeader<ContainerInfo, unknown>
          table={isDockerOverview ? table : undefined}
          column={column}
          hidden
        />
      );
    },

    meta: {
      translationId: 'dockerOverview.state-badge',
    },

    accessorFn: (row) => row.State,
    cell: ({ row }) => {
      const badgeClass = row.original.State === DOCKER_STATES.RUNNING ? 'bg-green-500' : 'bg-red-500';
      const { pathname } = useLocation();
      const isDockerOverview = pathname === `/${APPS.SETTINGS}`;

      return (
        <SelectableTextCell
          row={isDockerOverview ? row : undefined}
          icon={<div className={cn('h-2 w-2 rounded-full', badgeClass)} />}
        />
      );
    },
  },
  {
    id: DOCKER_CONTAINER_TABLE_COLUMNS.NAME,
    header: ({ column }) => <SortableHeader<ContainerInfo, unknown> column={column} />,

    meta: {
      translationId: 'dockerOverview.containerName',
    },

    accessorFn: (row) => row.Names[0],
    cell: ({ row }) => {
      const onClick = () => {};
      return (
        <TooltipProvider>
          <ActionTooltip
            tooltipText={row.original.Image}
            trigger={
              <SelectableTextCell
                onClick={onClick}
                text={row.original.Names[0].split('/')[1]}
              />
            }
          />
        </TooltipProvider>
      );
    },
  },
  {
    id: DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_IMAGE,
    header: ({ column }) => <SortableHeader<ContainerInfo, unknown> column={column} />,

    meta: {
      translationId: 'dockerOverview.imageName',
    },

    accessorFn: (row) => row.Image,
    cell: ({ row }) => {
      const onClick = () => {};
      return (
        <TooltipProvider>
          <ActionTooltip
            tooltipText={row.original.Image}
            trigger={
              <SelectableTextCell
                onClick={onClick}
                text={row.original.Image}
              />
            }
          />
        </TooltipProvider>
      );
    },
  },
  {
    id: DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_STATE,
    header: ({ column }) => <SortableHeader<ContainerInfo, unknown> column={column} />,

    meta: {
      translationId: 'dockerOverview.state',
    },

    accessorFn: (row) => row.State,
    cell: ({ row }) => {
      const onClick = () => {};
      return (
        <SelectableTextCell
          onClick={onClick}
          text={i18n.t(`docker.status.${row.original.State}`)}
          className="cursor-auto"
        />
      );
    },
  },
  {
    id: DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_STATUS,
    header: ({ column }) => <SortableHeader<ContainerInfo, unknown> column={column} />,

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
          className="cursor-auto"
        />
      );
    },
  },
  {
    id: DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_PORT,
    header: ({ column }) => <SortableHeader<ContainerInfo, unknown> column={column} />,

    meta: {
      translationId: 'dockerOverview.port',
    },

    accessorFn: (row) => row.Ports,
    cell: ({ row }) => {
      const onClick = () => {};
      const portArry = row.original.Ports?.map((port) =>
        port.IP === '0.0.0.0' ? `${port.PublicPort}/${port.Type}` : null,
      ).filter((item): item is string => item !== null);
      return (
        <SelectableTextCell
          onClick={onClick}
          text={portArry.join(', ')}
          className="cursor-auto"
        />
      );
    },
  },
  {
    id: DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_CREATION_DATE,
    header: ({ column }) => <SortableHeader<ContainerInfo, unknown> column={column} />,

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
