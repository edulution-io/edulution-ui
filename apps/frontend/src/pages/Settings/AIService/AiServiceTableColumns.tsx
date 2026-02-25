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
import {
  faAlignLeft,
  faEye,
  faEyeSlash,
  faImage,
  faScrewdriverWrench,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import AiServiceResponseDto from '@libs/aiService/types/aiServiceResponseDto';
import AI_SERVICE_CAPABILITIES from '@libs/aiService/constants/aiServiceCapabilities';
import AI_SERVICE_PROFICIENCY_COLORS from '@libs/aiService/constants/aiServiceProficiencyColors';
import AI_SERVICE_TABLE_COLUMNS from '@libs/aiService/constants/aiServiceTableColumns';
import AiServiceCapabilityType from '@libs/aiService/types/aiServiceCapabilityType';
import useAiServiceTableStore from '@/pages/Settings/AIService/useAiServiceTableStore';

const CAPABILITY_ICONS: Record<AiServiceCapabilityType, typeof faScrewdriverWrench> = {
  [AI_SERVICE_CAPABILITIES.TEXT_GENERATION]: faAlignLeft,
  [AI_SERVICE_CAPABILITIES.TOOL_EXECUTION]: faScrewdriverWrench,
  [AI_SERVICE_CAPABILITIES.VISION]: faEye,
  [AI_SERVICE_CAPABILITIES.IMAGE_GENERATION]: faImage,
};

const AiServiceTableColumns: ColumnDef<AiServiceResponseDto>[] = [
  {
    id: AI_SERVICE_TABLE_COLUMNS.NAME,
    size: 120,
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
    size: 60,
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
    id: AI_SERVICE_TABLE_COLUMNS.PURPOSE,
    size: 60,
    header: ({ column }) => <SortableHeader<AiServiceResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'settings.aiServices.purpose',
    },
    accessorFn: (row) => row.purpose,
    cell: ({ row }) => {
      const { setSelectedAiService, setIsDialogOpen } = useAiServiceTableStore();
      const handleRowClick = () => {
        setSelectedAiService(row.original);
        setIsDialogOpen(true);
      };

      return (
        <SelectableCell
          onClick={handleRowClick}
          text={row.original.purpose}
        />
      );
    },
  },
  {
    id: AI_SERVICE_TABLE_COLUMNS.MODEL,
    size: 60,
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
    id: AI_SERVICE_TABLE_COLUMNS.IS_DATA_PRIVACY_COMPLIANT,
    size: 60,
    header: ({ column }) => <SortableHeader<AiServiceResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'settings.aiServices.isDataPrivacyCompliant',
    },
    accessorFn: (row) => row.isDataPrivacyCompliant,
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
              icon={faShieldHalved}
              className={row.original.isDataPrivacyCompliant ? 'text-green-500' : 'text-ciLightGrey'}
            />
          }
          onClick={handleRowClick}
        />
      );
    },
  },
  {
    id: AI_SERVICE_TABLE_COLUMNS.CAPABILITIES,
    size: 60,
    header: ({ column }) => <SortableHeader<AiServiceResponseDto, unknown> column={column} />,
    meta: {
      translationId: 'settings.aiServices.capabilities',
    },
    accessorFn: (row) => row.capabilities?.map((cap) => cap.type).join(', ') ?? '',
    cell: ({ row }) => {
      const { setSelectedAiService, setIsDialogOpen } = useAiServiceTableStore();
      const handleRowClick = () => {
        setSelectedAiService(row.original);
        setIsDialogOpen(true);
      };
      const capabilities = row.original.capabilities ?? [];

      return (
        <SelectableCell
          onClick={handleRowClick}
          icon={
            capabilities.length > 0 ? (
              <div className="flex gap-2">
                {capabilities.map((cap) => (
                  <FontAwesomeIcon
                    key={cap.type}
                    icon={CAPABILITY_ICONS[cap.type]}
                    className={AI_SERVICE_PROFICIENCY_COLORS[cap.proficiency]}
                  />
                ))}
              </div>
            ) : undefined
          }
        />
      );
    },
  },
  {
    id: AI_SERVICE_TABLE_COLUMNS.CREATED_AT,
    size: 60,
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
