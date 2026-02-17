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
import useAiAssistantTableStore from '@/pages/Settings/AppConfig/chat/useAiAssistantTableStore';
import AiAssistantResponseDto from '@libs/aiAssistant/types/aiAssistantResponseDto';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import AI_ASSISTANT_TABLE_COLUMNS from '@libs/aiAssistant/constants/aiAssistantTableColumns';
import useAiServiceTableStore from '@/pages/Settings/AIService/useAiServiceTableStore';
import useAppConfigTableDialogStore from '../components/table/useAppConfigTableDialogStore';

const AppConfigAiAssistantTableColumn: ColumnDef<AiAssistantResponseDto>[] = [
  {
    id: AI_ASSISTANT_TABLE_COLUMNS.NAME,
    header: ({ column }) => <SortableHeader<AiAssistantResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'chat.assistant.assistantName',
    },
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const { setSelectedAssistant } = useAiAssistantTableStore();
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const handleRowClick = () => {
        setSelectedAssistant(row.original);
        setDialogOpen(ExtendedOptionKeys.CHAT_AI_ASSISTANT_TABLE);
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
    id: AI_ASSISTANT_TABLE_COLUMNS.AI_SERVICE,
    header: ({ column }) => <SortableHeader<AiAssistantResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'chat.assistant.aiService',
    },
    accessorFn: (row) => row.aiServiceId,
    cell: ({ row }) => {
      const { setSelectedAssistant } = useAiAssistantTableStore();
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const { tableContentData: aiServices } = useAiServiceTableStore();
      const handleRowClick = () => {
        setSelectedAssistant(row.original);
        setDialogOpen(ExtendedOptionKeys.CHAT_AI_ASSISTANT_TABLE);
      };
      const aiService = aiServices.find((s) => s.id === row.original.aiServiceId);

      return (
        <SelectableCell
          onClick={handleRowClick}
          text={aiService ? `${aiService.name} (${aiService.model})` : row.original.aiServiceId}
        />
      );
    },
  },
  {
    id: AI_ASSISTANT_TABLE_COLUMNS.IS_ACTIVE,
    size: 60,
    header: ({ column }) => <SortableHeader<AiAssistantResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'bulletinboard.isActive',
    },
    accessorFn: (row) => row.isActive,
    cell: ({ row }) => {
      const { setSelectedAssistant } = useAiAssistantTableStore();
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const handleRowClick = () => {
        setSelectedAssistant(row.original);
        setDialogOpen(ExtendedOptionKeys.CHAT_AI_ASSISTANT_TABLE);
      };
      return (
        <SelectableCell
          icon={
            <FontAwesomeIcon
              icon={row.original.isActive ? faEye : faEyeSlash}
              className="text-green-500"
            />
          }
          onClick={handleRowClick}
        />
      );
    },
  },
  {
    id: AI_ASSISTANT_TABLE_COLUMNS.CREATED_AT,
    size: 130,
    header: ({ column }) => <SortableHeader<AiAssistantResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'common.createdAt',
    },
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => {
      const { setSelectedAssistant } = useAiAssistantTableStore();
      const { setDialogOpen } = useAppConfigTableDialogStore();
      const handleRowClick = () => {
        setSelectedAssistant(row.original);
        setDialogOpen(ExtendedOptionKeys.CHAT_AI_ASSISTANT_TABLE);
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

export default AppConfigAiAssistantTableColumn;
