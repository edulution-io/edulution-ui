import React from 'react';
import MultipleSelectorSH from '@/components/ui/MultipleSelectorSH';
import { useTranslation } from 'react-i18next';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';

export interface AsyncMultiSelectProps<T> {
  value?: T[];
  placeholder: string;
  delay?: number;
  onSearch: (value: string) => Promise<T[]>;
  onChange: (options: (T & MultipleSelectorOptionSH)[]) => void;
  showRemoveIconInBadge?: boolean;
  badgeClassName?: string;
}

const AsyncMultiSelect = <T extends MultipleSelectorOptionSH>({
  value,
  placeholder,
  delay = 700,
  onSearch,
  onChange,
  showRemoveIconInBadge,
  badgeClassName,
}: AsyncMultiSelectProps<T>) => {
  const { t } = useTranslation();

  const loadingIndicator = <p className="leading-1 py-2 text-center text-muted">{t('search.loading')}...</p>;
  const emptyIndicator = <p className="leading-1 w-full py-2 text-center text-muted">{t('search.no-results')}</p>;

  const handleChange = (options: MultipleSelectorOptionSH[]) => {
    onChange(options as (T & MultipleSelectorOptionSH)[]);
  };

  return (
    <MultipleSelectorSH
      value={value}
      placeholder={placeholder}
      loadingIndicator={loadingIndicator}
      emptyIndicator={emptyIndicator}
      delay={delay}
      badgeClassName={badgeClassName || 'text-base font-normal'}
      className="rounded-lg py-1"
      onChange={handleChange}
      onSearch={onSearch}
      inputProps={{ className: 'text-base m-0' }}
      showRemoveIconInBadge={showRemoveIconInBadge}
    />
  );
};

export default AsyncMultiSelect;
