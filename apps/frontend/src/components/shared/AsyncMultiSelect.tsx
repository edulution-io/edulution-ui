import React from 'react';
import MultipleSelectorSH, { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import { useTranslation } from 'react-i18next';

export interface AsyncMultiSelectProps<T> {
  value?: T[];
  placeholder: string;
  delay?: number;
  onSearch: (value: string) => Promise<T[]>;
  onChange: (options: MultipleSelectorOptionSH[]) => void;
}

const AsyncMultiSelect = <T extends MultipleSelectorOptionSH>({
  value,
  placeholder,
  delay = 700,
  onSearch,
  onChange,
}: AsyncMultiSelectProps<T>) => {
  const { t } = useTranslation();

  const loadingIndicator = <p className="leading-1 py-2 text-center text-muted-foreground">{t('search.loading')}...</p>;
  const emptyIndicator = (
    <p className="leading-1 w-full py-2 text-center text-muted-foreground">{t('search.no-results')}</p>
  );

  return (
    <MultipleSelectorSH
      value={value}
      placeholder={placeholder}
      loadingIndicator={loadingIndicator}
      emptyIndicator={emptyIndicator}
      delay={delay}
      badgeClassName="text-base font-normal"
      className="rounded-lg py-1"
      onChange={onChange}
      onSearch={onSearch}
      inputProps={{ className: 'text-base m-0' }}
      commandProps={{}}
    />
  );
};

export default AsyncMultiSelect;
