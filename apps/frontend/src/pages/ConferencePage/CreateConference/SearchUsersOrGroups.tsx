import React from 'react';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { useTranslation } from 'react-i18next';
import Attendee from '@/pages/ConferencePage/dto/attendee';

interface SearchUsersOrGroupsProps {
  value: Attendee[];
  onChange: (options: MultipleSelectorOptionSH[]) => void;
  onSearch: (value: string) => Promise<Attendee[]>;
  options?: Attendee[];
}

const SearchUsersOrGroups = ({ options, value, onChange, onSearch }: SearchUsersOrGroupsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col text-black">
      <p className="text-m font-bold">{t('conferences.attendees')}</p>
      <AsyncMultiSelect<Attendee>
        value={value}
        onSearch={onSearch}
        onChange={onChange}
        placeholder={t('search.type-to-search')}
        options={options}
      />
    </div>
  );
};

export default SearchUsersOrGroups;
