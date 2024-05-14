import React, { useState } from 'react';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { useTranslation } from 'react-i18next';
import Attendee from '@/pages/ConferencePage/dto/attendee';

interface SearchUsersOrGroupsProps {
  onChange: (options: MultipleSelectorOptionSH[]) => void;
  onSearch: (value: string) => Promise<Attendee[]>;
}

const SearchUsersOrGroups = ({ onChange, onSearch }: SearchUsersOrGroupsProps) => {
  const [options] = useState([]);
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col text-black">
      <p className="text-m font-bold">{t('conferences.attendees')}</p>
      <AsyncMultiSelect
        onSearch={onSearch}
        options={options}
        onChange={onChange}
        placeholder={t('search.type-to-search')}
      />
    </div>
  );
};

export default SearchUsersOrGroups;
