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

import React, { useState } from 'react';
import { Table } from '@tanstack/react-table';
import { ArrowDownAZ, ArrowUpAZ, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import cn from '@libs/common/utils/className';
import { inputVariants } from '@libs/ui/constants/commonClassNames';
import { Button } from '@/components/shared/Button';
import DropdownMenu from '@/components/shared/DropdownMenu';

interface SortDropdownProps<TData> {
  table: Table<TData>;
  isDialog?: boolean;
}

const SortDropdown = <TData,>({ table, isDialog }: SortDropdownProps<TData>) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const sortableColumns = table.getAllColumns().filter((column) => column.getCanSort());

  const currentSort = table.getState().sorting[0];

  const dropdownItems = sortableColumns.flatMap((column) => {
    const label = t(column.columnDef.meta?.translationId ?? column.id);
    const isCurrentAsc = currentSort?.id === column.id && !currentSort?.desc;
    const isCurrentDesc = currentSort?.id === column.id && currentSort?.desc;

    return [
      {
        label: `${label} (${t('common.ascending')})`,
        icon: ArrowDownAZ,
        onClick: () => {
          column.toggleSorting(false);
          setIsOpen(false);
        },
        checked: isCurrentAsc,
      },
      {
        label: `${label} (${t('common.descending')})`,
        icon: ArrowUpAZ,
        onClick: () => {
          column.toggleSorting(true);
          setIsOpen(false);
        },
        checked: isCurrentDesc,
      },
    ];
  });

  if (sortableColumns.length === 0) {
    return null;
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button
          variant="btn-table"
          className={cn('max-w-fit', inputVariants({ variant: isDialog ? 'dialog' : 'default' }))}
        >
          {t('common.sort')} <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </Button>
      }
      items={dropdownItems}
    />
  );
};

export default SortDropdown;
