import React from 'react';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { useTranslation } from 'react-i18next';
import AttendeeDto from '@libs/user/types/attendee.dto';
import { Button } from '@/components/shared/Button';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';

interface SearchUsersOrGroupsProps {
  users: AttendeeDto[];
  onUserChange: (options: MultipleSelectorOptionSH[]) => void;
  onSearch: (value: string) => Promise<AttendeeDto[]>;
  groups: MultipleSelectorGroup[];
  onGroupSearch: (value: string) => Promise<MultipleSelectorGroup[]>;
  onGroupsChange: (options: MultipleSelectorGroup[]) => void;
  disabled?: boolean;
  hideGroupSearch?: boolean;
  variant?: 'default' | 'dialog';
}

const SearchUsersOrGroups = ({
  users,
  onUserChange,
  onSearch,
  groups,
  onGroupsChange,
  onGroupSearch,
  disabled,
  hideGroupSearch,
  variant,
}: SearchUsersOrGroupsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col">
      <p className="text-m font-bold text-background">{t('conferences.attendees')}</p>
      <AsyncMultiSelect<AttendeeDto>
        value={users}
        disabled={disabled}
        onSearch={onSearch}
        onChange={onUserChange}
        variant={variant}
        placeholder={disabled ? '' : t('search.type-to-search')}
      />
      {users?.length && users.length > 1 && !disabled ? (
        <div className="mt-2 flex justify-end">
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
      {hideGroupSearch ? null : (
        <>
          <p className="text-m font-bold text-background">{t('common.groups')}</p>
          <AsyncMultiSelect<MultipleSelectorGroup>
            value={groups}
            disabled={disabled}
            onSearch={onGroupSearch}
            onChange={onGroupsChange}
            placeholder={disabled ? '' : t('search.type-to-search')}
            variant={variant}
          />
        </>
      )}
    </div>
  );
};

export default SearchUsersOrGroups;
