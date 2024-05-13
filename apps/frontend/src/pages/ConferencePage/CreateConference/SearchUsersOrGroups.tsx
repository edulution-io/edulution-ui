import React, { useState } from 'react';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { useTranslation } from 'react-i18next';

interface SearchUsersOrGroupsProps {
  onChange: (options: MultipleSelectorOptionSH[]) => void;
  onSearch: (value: string) => Promise<MultipleSelectorOptionSH[]>;
}

const SearchUsersOrGroups = ({ onChange, onSearch }: SearchUsersOrGroupsProps) => {
  const [options] = useState([]);
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col text-black">
      <p className="text-m font-bold">{t('conferences.attendees')}</p>
      <AsyncMultiSelect
        onSearch={async (value) => {
          const res = await onSearch(value);
          return res;
        }}
        options={options}
        onChange={onChange}
        placeholder={t('search.type-to-search')}
      />
    </div>
  );
};

export default SearchUsersOrGroups;
