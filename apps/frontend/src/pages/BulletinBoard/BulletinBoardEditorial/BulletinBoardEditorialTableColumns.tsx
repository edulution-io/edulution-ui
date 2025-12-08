/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { IoEyeSharp } from 'react-icons/io5';
import { FaEyeSlash } from 'react-icons/fa';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialStore';
import { FaClock } from 'react-icons/fa6';
import BULLETIN_BOARD_EDITORIAL_TABLE_COLUMNS from '@libs/bulletinBoard/constants/bulletinBoardEditorialTableColumns';
import hideOnMobileClassName from '@libs/ui/constants/hideOnMobileClassName';

const bulletinBoardEditorialTableColumns: ColumnDef<BulletinResponseDto>[] = [
  {
    id: BULLETIN_BOARD_EDITORIAL_TABLE_COLUMNS.NAME,
    header: ({ column, table }) => (
      <SortableHeader<BulletinResponseDto, unknown>
        column={column}
        table={table}
      />
    ),

    meta: {
      translationId: 'bulletinboard.name',
    },

    accessorFn: (row) => row.title?.toLowerCase(),
    cell: ({ row }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();
      return (
        <SelectableTextCell
          onClick={() => {
            setIsCreateBulletinDialogOpen(true);
            setSelectedBulletinToEdit(row.original);
          }}
          text={row.original.title}
          isFirstColumn
          row={row}
        />
      );
    },
  },
  {
    id: BULLETIN_BOARD_EDITORIAL_TABLE_COLUMNS.CATEGORY,
    header: ({ column }) => <SortableHeader<BulletinResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'bulletinboard.category',
    },

    accessorFn: (row) => row.category.name,
    cell: ({ row }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();
      return (
        <SelectableTextCell
          text={row.original.category?.name}
          onClick={() => {
            setIsCreateBulletinDialogOpen(true);
            setSelectedBulletinToEdit(row.original);
          }}
        />
      );
    },
  },
  {
    id: BULLETIN_BOARD_EDITORIAL_TABLE_COLUMNS.IS_ACTIVE,
    size: 120,
    header: ({ column }) => (
      <SortableHeader<BulletinResponseDto, unknown>
        column={column}
        className={hideOnMobileClassName}
      />
    ),

    meta: {
      translationId: 'bulletinboard.isActiveOrExpired',
    },
    accessorFn: (row) => {
      const currentDate = new Date();
      const startDate = row.isVisibleStartDate ? new Date(row.isVisibleStartDate) : null;
      const endDate = row.isVisibleEndDate ? new Date(row.isVisibleEndDate) : null;
      const isExpired = (startDate && currentDate < startDate) || (endDate && currentDate > endDate);
      return row.isActive && !isExpired;
    },
    cell: ({ row: { original } }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();

      const currentDate = new Date();
      const startDate = original.isVisibleStartDate ? new Date(original.isVisibleStartDate) : null;
      const endDate = original.isVisibleEndDate ? new Date(original.isVisibleEndDate) : null;
      const isExpired = (startDate && currentDate < startDate) || (endDate && currentDate > endDate);

      const isActiveIcon = original.isActive ? (
        <IoEyeSharp className="text-green-500" />
      ) : (
        <FaEyeSlash className="text-red-500" />
      );

      return (
        <SelectableTextCell
          icon={isExpired ? <FaClock className="text-red-500" /> : isActiveIcon}
          onClick={() => {
            setIsCreateBulletinDialogOpen(true);
            setSelectedBulletinToEdit(original);
          }}
        />
      );
    },
  },
  {
    id: BULLETIN_BOARD_EDITORIAL_TABLE_COLUMNS.IS_VISIBLE_START_DATE,
    size: 155,
    header: ({ column }) => <SortableHeader<BulletinResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'bulletinboard.isVisibleStartDate',
    },
    accessorFn: (row) => row.isVisibleStartDate,
    cell: ({ row: { original } }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();
      return (
        <SelectableTextCell
          text={original.isVisibleStartDate ? new Date(original.isVisibleStartDate).toLocaleString() : ''}
          onClick={() => {
            setIsCreateBulletinDialogOpen(true);
            setSelectedBulletinToEdit(original);
          }}
        />
      );
    },
  },
  {
    id: BULLETIN_BOARD_EDITORIAL_TABLE_COLUMNS.IS_VISIBLE_END_DATE,
    size: 155,
    header: ({ column }) => <SortableHeader<BulletinResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'bulletinboard.isVisibleEndDate',
    },
    accessorFn: (row) => row.isVisibleEndDate,
    cell: ({ row: { original } }) => {
      const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();
      return (
        <SelectableTextCell
          text={original.isVisibleEndDate ? new Date(original.isVisibleEndDate).toLocaleString() : ''}
          onClick={() => {
            setIsCreateBulletinDialogOpen(true);
            setSelectedBulletinToEdit(original);
          }}
        />
      );
    },
  },
];

export default bulletinBoardEditorialTableColumns;
