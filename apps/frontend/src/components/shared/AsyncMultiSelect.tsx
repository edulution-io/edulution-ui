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
import MultipleSelectorSH from '@/components/ui/MultipleSelectorSH';
import { useTranslation } from 'react-i18next';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';

export interface AsyncMultiSelectProps<T> {
  value?: T[];
  disabled?: boolean;
  placeholder: string;
  delay?: number;
  onSearch: (value: string) => Promise<T[]>;
  onChange: (options: (T & MultipleSelectorOptionSH)[]) => void;
  showRemoveIconInBadge?: boolean;
  badgeClassName?: string;
  variant?: 'default' | 'dialog';
}

const AsyncMultiSelect = <T extends MultipleSelectorOptionSH>({
  value,
  disabled,
  placeholder,
  delay = 700,
  onSearch,
  onChange,
  variant = 'default',
  showRemoveIconInBadge,
  badgeClassName,
}: AsyncMultiSelectProps<T>) => {
  const { t } = useTranslation();

  const loadingIndicator = (
    <p className={`leading-1 py-2 text-center ${variant === 'default' ? 'text-secondary' : 'text-background'}`}>
      {t('search.loading')}...
    </p>
  );

  const emptyIndicator = (
    <p className={`leading-1 w-full py-2 text-center ${variant === 'default' ? 'text-secondary' : 'text-background'}`}>
      {t('search.no-results')}
    </p>
  );

  const handleChange = (options: MultipleSelectorOptionSH[]) => {
    onChange(options as (T & MultipleSelectorOptionSH)[]);
  };

  return (
    <MultipleSelectorSH
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      loadingIndicator={loadingIndicator}
      emptyIndicator={emptyIndicator}
      delay={delay}
      badgeClassName={badgeClassName || 'text-base font-normal '}
      className={`rounded-lg p-[8px] ${variant === 'default' ? 'bg-accent' : 'bg-muted'}`}
      onChange={handleChange}
      onSearch={onSearch}
      inputProps={{ className: 'text-base m-0' }}
      showRemoveIconInBadge={showRemoveIconInBadge}
      variant={variant}
    />
  );
};

export default AsyncMultiSelect;
