import React from 'react';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { useTranslation } from 'react-i18next';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import cn from '@/lib/utils';
import Group from '@/pages/ConferencePage/dto/group';
import { Button } from '@/components/shared/Button';
import CircleLoader from '@/components/ui/CircleLoader';

interface SearchUsersOrGroupsProps {
  users: Attendee[];
  onUserChange: (options: MultipleSelectorOptionSH[]) => void;
  onSearch: (value: string) => Promise<Attendee[]>;
  groups: Group[];
  onGroupSearch: (value: string) => Promise<Group[]>;
  onGroupsChange: (options: MultipleSelectorOptionSH[]) => void;
  isGetGroupMembersLoading: boolean;
}

const SearchUsersOrGroups = ({
  users,
  onUserChange,
  onSearch,
  groups,
  onGroupsChange,
  onGroupSearch,
  isGetGroupMembersLoading,
}: SearchUsersOrGroupsProps) => {
  const { t } = useTranslation();

  return (
    <div className={cn('flex w-full flex-col')}>
      <p className={cn('text-m font-bold', 'text-black')}>{t('conferences.attendees')}</p>
      <AsyncMultiSelect<Attendee>
        value={users}
        onSearch={onSearch}
        onChange={onUserChange}
        placeholder={t('search.type-to-search')}
      />
      {users?.length && users.length > 1 ? (
        <div className={'flex justify-end'}>
          <Button
            variant="btn-collaboration"
            size="lg"
            type="button"
            onClick={() => {
              onUserChange([]);
              onGroupsChange([]);
            }}
          >
            {t('common.clearSelection')}
          </Button>
        </div>
      ) : null}
      {isGetGroupMembersLoading ? <CircleLoader className={'mx-auto'} /> : null}
      <p className={cn('text-m font-bold', 'text-black')}>{t('common.groups')}</p>
      <AsyncMultiSelect<Group>
        value={groups}
        onSearch={onGroupSearch}
        onChange={onGroupsChange}
        placeholder={t('search.type-to-search')}
        badgeClassName="hidden"
      />
    </div>
  );
};

export default SearchUsersOrGroups;
