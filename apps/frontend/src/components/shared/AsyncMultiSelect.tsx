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
  variant?: 'light' | 'dark';
}

const AsyncMultiSelect = <T extends MultipleSelectorOptionSH>({
  value,
  disabled,
  placeholder,
  delay = 700,
  onSearch,
  onChange,
  variant = 'dark',
  showRemoveIconInBadge,
  badgeClassName,
}: AsyncMultiSelectProps<T>) => {
  const { t } = useTranslation();

  const loadingIndicator = (
    <p className={`leading-1 py-2 text-center ${variant === 'dark' ? 'text-ciLightGrey' : 'text-muted'}`}>
      {t('search.loading')}...
    </p>
  );

  const emptyIndicator = (
    <p className={`leading-1 w-full py-2 text-center ${variant === 'dark' ? 'text-ciLightGrey' : 'text-muted'}`}>
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
      className={`rounded-lg p-[8px] ${variant === 'dark' ? 'bg-ciDarkGrey' : ''}`}
      onChange={handleChange}
      onSearch={onSearch}
      inputProps={{ className: 'text-base m-0' }}
      showRemoveIconInBadge={showRemoveIconInBadge}
      variant={variant}
    />
  );
};

export default AsyncMultiSelect;
