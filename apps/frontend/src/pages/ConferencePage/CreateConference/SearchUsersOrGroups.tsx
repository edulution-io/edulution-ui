import React from 'react';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { useTranslation } from 'react-i18next';
import AttendeeDto from '@libs/conferences/types/attendee.dto';
import { Button } from '@/components/shared/Button';
import CircleLoader from '@/components/ui/CircleLoader';
import MultipleSelectorGroup from '@libs/user/types/groups/multipleSelectorGroup';

interface SearchUsersOrGroupsProps {
  users: AttendeeDto[];
  onUserChange: (options: MultipleSelectorOptionSH[]) => void;
  onSearch: (value: string) => Promise<AttendeeDto[]>;
  groups: MultipleSelectorGroup[];
  onGroupSearch: (value: string) => Promise<MultipleSelectorGroup[]>;
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
    <div className="flex w-full flex-col">
      <p className="text-m font-bold text-foreground">{t('conferences.attendees')}</p>
      <AsyncMultiSelect<AttendeeDto>
        value={users}
        onSearch={onSearch}
        onChange={onUserChange}
        placeholder={t('search.type-to-search')}
      />
      {users?.length && users.length > 1 ? (
        <div className="flex justify-end">
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
      {isGetGroupMembersLoading ? <CircleLoader className="mx-auto" /> : null}
      <p className="text-m font-bold text-foreground">{t('common.groups')}</p>
      <AsyncMultiSelect<MultipleSelectorGroup>
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
