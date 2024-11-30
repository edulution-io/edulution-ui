import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import getCreateNewCategorieSchema from '@libs/bulletinBoard/constants/createNewCategorieSchema';
import NewCategorieForm from '@libs/bulletinBoard/constants/NewCategorieForm';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import useUserStore from '@/store/UserStore/UserStore';
import useGroupStore from '@/store/GroupStore';
import { RadioGroupItemSH, RadioGroupSH } from '@/components/ui/RadioGroupSH';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';

const AppConfigBulletinTableDialog = () => {
  const { t } = useTranslation();

  const form = useForm<NewCategorieForm>({
    mode: 'onChange',
    resolver: zodResolver(getCreateNewCategorieSchema(t)),
    defaultValues: {
      name: '',
      isActive: true,
      visibleByUsers: [],
      visibleByGroups: [],
    },
  });

  const { setValue, watch } = form;
  const { searchAttendees } = useUserStore();
  const { searchGroups } = useGroupStore();

  const handleVisibleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('visibleByUsers', attendees, { shouldValidate: true });
  };

  const handleEditableAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('editableByUsers', attendees, { shouldValidate: true });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log(form.getValues(), 'Form Data Submitted');
    e.preventDefault();
  };

  return (
    <form
      onSubmit={(event) => {
        handleFormSubmit(event);
      }}
      className="space-y-4"
    >
      <div>
        <input
          {...form.register('name')}
          placeholder={t('bulletinBoard.categoryNamePlaceholder')}
          className="input-class"
        />
      </div>
      <SearchUsersOrGroups
        users={watch('visibleByUsers') as AttendeeDto[]}
        onSearch={searchAttendees}
        onUserChange={handleVisibleAttendeesChange}
        groups={watch('visibleByGroups') as MultipleSelectorGroup[]}
        onGroupSearch={searchGroups}
        onGroupsChange={(groups) => setValue('visibleByGroups', groups, { shouldValidate: true })}
        variant="light"
      />

      <SearchUsersOrGroups
        users={watch('editableByUsers') as AttendeeDto[]}
        onSearch={searchAttendees}
        onUserChange={handleEditableAttendeesChange}
        groups={watch('editableByGroups') as MultipleSelectorGroup[]}
        onGroupSearch={searchGroups}
        onGroupsChange={(groups) => setValue('editableByGroups', groups, { shouldValidate: true })}
        variant="light"
      />

      <div>
        <span className="text-sm font-medium">{t('bulletinBoard.isActive')}</span>
        <RadioGroupSH
          value={watch('isActive') ? 'true' : 'false'}
          onValueChange={(value) => setValue('isActive', value === 'true', { shouldValidate: true })}
          className="flex gap-4"
        >
          <span className="flex items-center gap-2">
            <RadioGroupItemSH
              value="true"
              id="isActive-yes"
            />
            <span>{t('common.yes')}</span>
          </span>
          <span className="flex items-center gap-2">
            <RadioGroupItemSH
              value="false"
              id="isActive-no"
            />
            <span>{t('common.no')}</span>
          </span>
        </RadioGroupSH>
      </div>
      <Button
        variant="btn-collaboration"
        size="lg"
        type="submit"
      >
        {t('common.create')}
      </Button>
    </form>
  );
};

export default AppConfigBulletinTableDialog;
