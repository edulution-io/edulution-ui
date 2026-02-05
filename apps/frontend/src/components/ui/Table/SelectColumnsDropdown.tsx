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
import { Button } from '@edulution-io/ui-kit';
import DropdownMenu from '@/components/shared/DropdownMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { inputVariants } from '@libs/ui/constants/commonClassNames';
import cn from '@libs/common/utils/className';

interface SelectColumnsDropdownProps<TData> {
  table: Table<TData>;
  isDialog?: boolean;
}

const SelectColumnsDropdown = <TData,>({ table, isDialog }: SelectColumnsDropdownProps<TData>) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const dropdownItems = table
    .getAllColumns()
    .filter((column) => column.getCanHide())
    .map((column) => ({
      label: t(column.columnDef.meta?.translationId ?? column.id),
      isCheckbox: true,
      checked: column.getIsVisible(),
      onCheckedChange: (visible: boolean) => column.toggleVisibility(visible),
    }));

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button
          variant="btn-table"
          className={cn('max-w-fit', inputVariants({ variant: isDialog ? 'dialog' : 'default' }))}
        >
          {t('common.columns')}{' '}
          <FontAwesomeIcon
            icon={faChevronDown}
            className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')}
          />
        </Button>
      }
      items={dropdownItems}
    />
  );
};

export default SelectColumnsDropdown;
