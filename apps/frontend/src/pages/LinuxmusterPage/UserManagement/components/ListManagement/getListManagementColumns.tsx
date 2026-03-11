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
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { Button, cn, Input } from '@edulution-io/ui-kit';
import { DeleteIcon } from '@libs/common/constants/standardActionIcons';
import parseDDMMYYYY from '@libs/common/utils/Date/parseDDMMYYYY';
import validateCell from '@libs/userManagement/utils/validateCell';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import type ColumnConfig from '@libs/userManagement/types/columnConfig';
import LIST_MANAGEMENT_COLUMNS from '@libs/userManagement/constants/listManagementColumns';
import type { ManagementListType } from '@libs/userManagement/constants/managementListTypes';
import type ListManagementRow from '@libs/userManagement/types/listManagementRow';
import USER_MANAGEMENT_COLUMN_IDS from '@libs/userManagement/constants/userManagementColumnIds';

interface ListManagementColumnsProps {
  managementList: ManagementListType;
  isNewRow: (rowId: string) => boolean;
  isCellChanged: (rowId: string, columnKey: string) => boolean;
  onCellChange: (rowIndex: number, columnKey: string, value: string) => void;
  onCellBlur: (rowIndex: number, columnKey: string) => void;
  onDeleteRow: (rowIndex: number) => void;
}

const getListManagementColumns = ({
  managementList,
  isNewRow,
  isCellChanged,
  onCellChange,
  onCellBlur,
  onDeleteRow,
}: ListManagementColumnsProps): ColumnDef<ListManagementRow>[] => {
  const columnConfigs = LIST_MANAGEMENT_COLUMNS[managementList];

  const cols: ColumnDef<ListManagementRow>[] = columnConfigs.map((config: ColumnConfig) => ({
    id: config.key,
    accessorKey: config.key,
    ...(config.key === USER_MANAGEMENT_COLUMN_IDS.BIRTHDAY && {
      sortingFn: (rowA, rowB) => {
        const a = rowA.getValue<string>(USER_MANAGEMENT_COLUMN_IDS.BIRTHDAY) || '';
        const b = rowB.getValue<string>(USER_MANAGEMENT_COLUMN_IDS.BIRTHDAY) || '';
        return parseDDMMYYYY(a) - parseDDMMYYYY(b);
      },
    }),
    header: ({ column }) => {
      if (config.key === 'login') {
        const { t } = useTranslation();
        return (
          <div className="flex items-center gap-1">
            <SortableHeader column={column} />
            <Tooltip>
              <TooltipTrigger asChild>
                <FontAwesomeIcon
                  icon={faCircleQuestion}
                  className="h-3 w-3 text-muted-foreground"
                />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">{t('usermanagement.list.loginTooltip')}</TooltipContent>
            </Tooltip>
          </div>
        );
      }
      return <SortableHeader column={column} />;
    },
    meta: { translationId: config.translationKey },
    size: 50,
    cell: ({ row, getValue }) => {
      const value = (getValue() as string) || '';
      const isValid = validateCell(config.key, value);
      const isNew = isNewRow(row.id);
      const isChanged = isCellChanged(row.id, config.key);
      return (
        <Input
          value={value}
          onChange={(e) => onCellChange(row.index, config.key, e.target.value)}
          onBlur={() => onCellBlur(row.index, config.key)}
          className={cn(
            'h-8 border bg-transparent hover:bg-white focus:bg-white dark:bg-transparent dark:hover:bg-accent dark:focus:bg-accent',
            !isValid && 'border-red-400',
            isValid && isNew && 'border-green-300',
            isValid && !isNew && isChanged && 'border-blue-300',
            isValid && !isNew && !isChanged && 'border-transparent',
          )}
          variant="default"
        />
      );
    },
  }));

  cols.push({
    id: USER_MANAGEMENT_COLUMN_IDS.ACTIONS,
    header: () => null,
    size: 20,
    enableHiding: false,
    cell: ({ row }) => {
      const { t } = useTranslation();
      return (
        <Button
          type="button"
          variant="btn-ghost"
          onClick={() => onDeleteRow(row.index)}
          className="p-2 text-red-500 hover:text-red-700"
          aria-label={t('delete')}
        >
          <FontAwesomeIcon icon={DeleteIcon} />
        </Button>
      );
    },
  });

  return cols;
};

export default getListManagementColumns;
