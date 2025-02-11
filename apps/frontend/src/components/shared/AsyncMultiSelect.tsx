/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
