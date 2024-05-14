import React from 'react';
import MultipleSelectorSH, { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import { useTranslation } from 'react-i18next';
import Attendee from '@/pages/ConferencePage/dto/attendee';

export interface AsyncMultiSelectProps {
  options: Attendee[];
  placeholder: string;
  delay?: number;
  onSearch: (value: string) => Promise<Attendee[]>;
  onChange: (options: MultipleSelectorOptionSH[]) => void;
}

const AsyncMultiSelect = ({ options, placeholder, delay = 700, onSearch, onChange }: AsyncMultiSelectProps) => {
  const { t } = useTranslation();

  const loadingIndicator = <p className="leading-1 py-2 text-center text-muted-foreground">{t('search.loading')}...</p>;
  const emptyIndicator = (
    <p className="leading-1 w-full py-2 text-center text-muted-foreground">{t('search.no-results')}</p>
  );

  return (
    <MultipleSelectorSH
      options={options}
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
