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
import SelectableCell from '@/components/ui/Table/SelectableCell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import AiServiceResponseDto from '@libs/aiService/types/aiServiceResponseDto';
import AI_SERVICE_TABLE_COLUMNS from '@libs/aiService/constants/aiServiceTableColumns';
import useAiServiceTableStore from '@/pages/Settings/AIService/useAiServiceTableStore';

const AiServiceTableColumns: ColumnDef<AiServiceResponseDto>[] = [
  {
    id: AI_SERVICE_TABLE_COLUMNS.NAME,
    header: ({ column }) => <SortableHeader<AiServiceResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'common.name',
    },
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { setSelectedAiService, setIsDialogOpen } = useAiServiceTableStore();
      const handleRowClick = () => {
        setSelectedAiService(row.original);
        setIsDialogOpen(true);
      };

      return (
        <SelectableCell
          onClick={handleRowClick}
          text={row.original.name}
        />
      );
    },
  },
  {
    id: AI_SERVICE_TABLE_COLUMNS.PROVIDER,
    size: 120,
    header: ({ column }) => <SortableHeader<AiServiceResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'settings.aiServices.provider',
    },
    accessorFn: (row) => row.provider,
    cell: ({ row }) => {
      const { setSelectedAiService, setIsDialogOpen } = useAiServiceTableStore();
      const handleRowClick = () => {
        setSelectedAiService(row.original);
        setIsDialogOpen(true);
      };

      return (
        <SelectableCell
          onClick={handleRowClick}
          text={row.original.provider}
        />
      );
    },
  },
  {
    id: AI_SERVICE_TABLE_COLUMNS.MODEL,
    size: 150,
    header: ({ column }) => <SortableHeader<AiServiceResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'settings.aiServices.model',
    },
    accessorFn: (row) => row.model,
    cell: ({ row }) => {
      const { setSelectedAiService, setIsDialogOpen } = useAiServiceTableStore();
      const handleRowClick = () => {
        setSelectedAiService(row.original);
        setIsDialogOpen(true);
      };

      return (
        <SelectableCell
          onClick={handleRowClick}
          text={row.original.model}
        />
      );
    },
  },
  {
    id: AI_SERVICE_TABLE_COLUMNS.IS_ACTIVE,
    size: 60,
    header: ({ column }) => <SortableHeader<AiServiceResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'settings.aiServices.isActive',
    },
    accessorFn: (row) => row.isActive,
    cell: ({ row }) => {
      const { setSelectedAiService, setIsDialogOpen } = useAiServiceTableStore();
      const handleRowClick = () => {
        setSelectedAiService(row.original);
        setIsDialogOpen(true);
      };

      return (
        <SelectableCell
          icon={
            <FontAwesomeIcon
              icon={row.original.isActive ? faEye : faEyeSlash}
              className={row.original.isActive ? 'text-green-500' : 'text-ciLightGrey'}
            />
          }
          onClick={handleRowClick}
        />
      );
    },
  },
  {
    id: AI_SERVICE_TABLE_COLUMNS.CREATED_AT,
    size: 130,
    header: ({ column }) => <SortableHeader<AiServiceResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'common.createdAt',
    },
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => {
      const { setSelectedAiService, setIsDialogOpen } = useAiServiceTableStore();
      const handleRowClick = () => {
        setSelectedAiService(row.original);
        setIsDialogOpen(true);
      };

      return (
        <SelectableCell
          onClick={handleRowClick}
          text={new Date(row.original.createdAt).toLocaleDateString()}
        />
      );
    },
  },
];

export default AiServiceTableColumns;
