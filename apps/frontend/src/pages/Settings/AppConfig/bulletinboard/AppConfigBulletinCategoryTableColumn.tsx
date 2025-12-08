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
import { FaEyeSlash } from 'react-icons/fa';
import { IoEyeSharp } from 'react-icons/io5';
import useBulletinCategoryTableStore from '@/pages/Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import SortTableCell from '@/components/ui/Table/SortTableCell';
import DEFAULT_TABLE_SORT_PROPERTY_KEY from '@libs/common/constants/defaultTableSortProperty';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import BULLETIN_BOARD_CATEGORY_TABLE_COLUMNS from '@libs/appconfig/constants/bulletinBoardCategoryTableColumns';
import hideOnMobileClassName from '@libs/ui/constants/hideOnMobileClassName';
import BULLETIN_VISIBILITY_STATES from '@libs/bulletinBoard/constants/bulletinVisibilityStates';
import { useTranslation } from 'react-i18next';
import useAppConfigTableDialogStore from '../components/table/useAppConfigTableDialogStore';

const AppConfigBulletinCategoryTableColumn: ColumnDef<BulletinCategoryResponseDto>[] = [
  {
    id: DEFAULT_TABLE_SORT_PROPERTY_KEY,
    size: 110,
    header: ({ column }) => (
      <SortableHeader<BulletinCategoryResponseDto, unknown>
        column={column}
        className={`max-w-32 ${hideOnMobileClassName}`}
      />
    ),
    meta: {
      translationId: 'common.sortOrder',
    },
    accessorFn: (row) => row.position,
    cell: ({ row }) => {
      const { setCategoryPosition, fetchTableContent, tableContentData } = useBulletinCategoryTableStore();
      const { id, position } = row.original;
      const moveUp = async () => {
        await setCategoryPosition(id, position - 1);
        await fetchTableContent();
      };
      const moveDown = async () => {
        await setCategoryPosition(id, position + 1);
        await fetchTableContent();
      };

      return (
        <SortTableCell
          moveUp={moveUp}
          moveDown={moveDown}
          lastPosition={tableContentData.length}
          position={position}
        />
      );
    },
  },
  {
    id: BULLETIN_BOARD_CATEGORY_TABLE_COLUMNS.NAME,
    header: ({ column }) => <SortableHeader<BulletinCategoryResponseDto, unknown> column={column} />,

    meta: {
      translationId: 'bulletinboard.name',
    },
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { setSelectedCategory } = useBulletinCategoryTableStore();
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setDialogOpen(ExtendedOptionKeys.BULLETIN_BOARD_CATEGORY_TABLE);
      };

      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={row.original.name}
        />
      );
    },
  },
  {
    id: BULLETIN_BOARD_CATEGORY_TABLE_COLUMNS.BULLETIN_VISIBILITY,
    size: 105,
    header: ({ column }) => <SortableHeader<BulletinCategoryResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'common.visibility',
    },
    accessorFn: (row) => row.bulletinVisibility,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const { setSelectedCategory } = useBulletinCategoryTableStore();
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setDialogOpen(ExtendedOptionKeys.BULLETIN_BOARD_CATEGORY_TABLE);
      };
      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={t(
            `bulletinboard.categories.${BULLETIN_VISIBILITY_STATES[row.original.bulletinVisibility || BULLETIN_VISIBILITY_STATES.FULLY_VISIBLE]}-short`,
          )}
        />
      );
    },
  },
  {
    id: BULLETIN_BOARD_CATEGORY_TABLE_COLUMNS.IS_ACTIVE,
    size: 60,
    header: ({ column }) => <SortableHeader<BulletinCategoryResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'bulletinboard.isActive',
    },
    accessorFn: (row) => row.isActive,
    cell: ({ row }) => {
      const { setSelectedCategory } = useBulletinCategoryTableStore();
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setDialogOpen(ExtendedOptionKeys.BULLETIN_BOARD_CATEGORY_TABLE);
      };
      return (
        <SelectableTextCell
          icon={
            row.original.isActive ? <IoEyeSharp className="text-green-500" /> : <FaEyeSlash className="text-red-500" />
          }
          onClick={handleRowClick}
        />
      );
    },
  },
  {
    id: BULLETIN_BOARD_CATEGORY_TABLE_COLUMNS.CREATED_AT,
    size: 130,
    header: ({ column }) => <SortableHeader<BulletinCategoryResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'common.createdAt',
    },
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => {
      const { setSelectedCategory } = useBulletinCategoryTableStore();
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const handleRowClick = () => {
        setSelectedCategory(row.original);
        setDialogOpen(ExtendedOptionKeys.BULLETIN_BOARD_CATEGORY_TABLE);
      };
      return (
        <SelectableTextCell
          onClick={handleRowClick}
          text={new Date(row.original.createdAt).toLocaleDateString()}
        />
      );
    },
  },
];

export default AppConfigBulletinCategoryTableColumn;
