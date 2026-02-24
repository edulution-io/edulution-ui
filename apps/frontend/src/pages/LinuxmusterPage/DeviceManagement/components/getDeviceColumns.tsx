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
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { Button, cn } from '@edulution-io/ui-kit';
import { DeleteIcon } from '@libs/common/constants/standardActionIcons';
import { validateDeviceCell } from '@libs/deviceManagement/utils/deviceValidation';
import DEVICE_COLUMNS from '@libs/deviceManagement/constants/deviceColumns';
import SOPHOMORIX_ROLES from '@libs/deviceManagement/constants/sophomorixRoles';
import PXE_FLAGS from '@libs/deviceManagement/constants/pxeFlags';
import type DeviceRow from '@libs/deviceManagement/types/deviceRow';
import type DeviceColumnConfig from '@libs/deviceManagement/types/deviceColumnConfig';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import Input from '@/components/shared/Input';
import { DropdownSelect } from '@/components';

interface DeviceColumnsProps {
  isNewRow: (rowId: string) => boolean;
  isCellChanged: (rowId: string, columnKey: string) => boolean;
  isDuplicate: (rowId: string, columnKey: string) => boolean;
  onCellChange: (rowIndex: number, columnKey: string, value: string) => void;
  onCellBlur: (rowIndex: number, columnKey: string) => void;
  onDeleteRow: (rowIndex: number) => void;
  onDuplicateRow: (rowIndex: number) => void;
}

const getDeviceColumns = ({
  isNewRow,
  isCellChanged,
  isDuplicate,
  onCellChange,
  onCellBlur,
  onDeleteRow,
  onDuplicateRow,
}: DeviceColumnsProps): ColumnDef<DeviceRow>[] => {
  const cols: ColumnDef<DeviceRow>[] = DEVICE_COLUMNS.map((config: DeviceColumnConfig) => ({
    id: config.key,
    accessorKey: config.key,
    header: ({ column }) => <SortableHeader column={column} />,
    meta: { translationId: config.translationKey },
    size: 35,
    cell: ({ row, getValue }) => {
      const value = (getValue() as string) || '';
      const isNew = isNewRow(row.id);
      const isChanged = isCellChanged(row.id, config.key);
      const isValid = config.type === 'dropdown' || validateDeviceCell(config.key, value);
      const isDup = isDuplicate(row.id, config.key);

      const borderColorClass = cn(
        (!isValid || isDup) && 'border-red-400',
        isValid && !isDup && isNew && 'border-green-300',
        isValid && !isDup && !isNew && isChanged && 'border-blue-300',
        isValid && !isDup && !isNew && !isChanged && 'border-transparent',
      );

      if (config.type === 'dropdown') {
        const dropdownOptions = config.key === 'sophomorixRole' ? [...SOPHOMORIX_ROLES] : [...PXE_FLAGS];

        return (
          <DropdownSelect
            options={dropdownOptions}
            selectedVal={value}
            handleChange={(val) => onCellChange(row.index, config.key, val)}
            classname="h-8"
            inputClassName={cn(
              'h-8 border bg-transparent text-sm hover:bg-white focus:bg-white dark:bg-transparent dark:hover:bg-accent dark:focus:bg-accent',
              borderColorClass,
            )}
            menuClassName="text-sm"
            translate
          />
        );
      }

      return (
        <Input
          value={value}
          onChange={(e) => onCellChange(row.index, config.key, e.target.value)}
          onBlur={() => onCellBlur(row.index, config.key)}
          className={cn(
            'h-8 border bg-transparent hover:bg-white focus:bg-white dark:bg-transparent dark:hover:bg-accent dark:focus:bg-accent',
            borderColorClass,
          )}
          variant="default"
        />
      );
    },
  }));

  cols.push({
    id: 'actions',
    header: () => null,
    size: 30,
    enableHiding: false,
    cell: ({ row }) => {
      const { t } = useTranslation();
      return (
        <div className="flex gap-1">
          <Button
            type="button"
            variant="btn-ghost"
            onClick={() => onDuplicateRow(row.index)}
            className="p-2 text-muted-foreground"
            aria-label={t('common.duplicate')}
          >
            <FontAwesomeIcon icon={faCopy} />
          </Button>
          <Button
            type="button"
            variant="btn-ghost"
            onClick={() => onDeleteRow(row.index)}
            className="p-2 text-red-500 hover:text-red-700"
            aria-label={t('delete')}
          >
            <FontAwesomeIcon icon={DeleteIcon} />
          </Button>
        </div>
      );
    },
  });

  return cols;
};

export default getDeviceColumns;
