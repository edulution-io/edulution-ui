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

const AppConfigBulletinTableDialog = () => {
  const { t } = useTranslation();

  // Form initialization
  const form = useForm<NewCategorieForm>({
    mode: 'onChange',
    resolver: zodResolver(getCreateNewCategorieSchema(t)),
    defaultValues: {
      name: '',
    },
  });

  const { setValue, watch } = form;
  const { user, searchAttendees } = useUserStore();
  const { searchGroups, searchGroupsIsLoading } = useGroupStore();

  // Handle attendees changes
  const handleAttendeesChange = (attendees: any[]) => {
    setValue('invitedAttendees', attendees, { shouldValidate: true });
  };

  // Fetch attendees on search
  const onAttendeesSearch = async (value: string) => {
    const result = await searchAttendees(value);
    return result.filter((r) => r.username !== user?.username);
  };

  // Handle groups changes
  const handleGroupsChange = (groups: any[]) => {
    setValue('invitedGroups', groups, { shouldValidate: true });
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(form.getValues(), 'lala');
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="space-y-4"
    >
      {/* Input for category name */}
      <div>
        <input
          {...form.register('name')}
          placeholder={t('bulletinBoard.categoryNamePlaceholder')}
          className="input-class" // Replace with your input styles
        />
      </div>

      {/* SearchUsersOrGroups integration */}
      <SearchUsersOrGroups
        users={watch('invitedAttendees') || []}
        onSearch={onAttendeesSearch}
        onUserChange={handleAttendeesChange}
        groups={watch('invitedGroups') || []}
        onGroupSearch={searchGroups}
        onGroupsChange={handleGroupsChange}
        variant="light"
      />

      {/* Submit button */}
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
