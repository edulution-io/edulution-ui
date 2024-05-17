import React from 'react';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { useTranslation } from 'react-i18next';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import { useMediaQuery } from 'usehooks-ts';
import cn from '@/lib/utils';

interface SearchUsersOrGroupsProps {
  value: Attendee[];
  onChange: (options: MultipleSelectorOptionSH[]) => void;
  onSearch: (value: string) => Promise<Attendee[]>;
}

const SearchUsersOrGroups = ({ value, onChange, onSearch }: SearchUsersOrGroupsProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { t } = useTranslation();

  return (
    <div className={cn('flex w-full flex-col')}>
      <p className={cn('text-m font-bold', isMobile ? 'text-white' : 'text-black')}>{t('conferences.attendees')}</p>
      <AsyncMultiSelect<Attendee>
        value={value}
        onSearch={onSearch}
        onChange={onChange}
        placeholder={t('search.type-to-search')}
      />
    </div>
  );
};

export default SearchUsersOrGroups;
