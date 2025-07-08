/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import useUserStore from '@/store/UserStore/useUserStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/useCreateConferenceDialogStore';
import useGroupStore from '@/store/GroupStore';
import RadioGroupFormField from '@/components/shared/RadioGroupFormField';
import CONFERENCES_IS_PUBLIC_FORM_VALUES from '@libs/conferences/constants/isPublicFormValues';
import ConferencesForm from '@libs/conferences/types/conferencesForm';

interface CreateConferenceDialogBodyProps {
  form: UseFormReturn<ConferencesForm>;
}

const CreateConferenceDialogBody = ({ form }: CreateConferenceDialogBodyProps) => {
  const { setValue, getValues, watch, control } = form;
  const { user, searchAttendees } = useUserStore();
  const { isLoading } = useCreateConferenceDialogStore();
  const { searchGroups, searchGroupsIsLoading } = useGroupStore();
  const { t } = useTranslation();

  if (isLoading) return <CircleLoader className="mx-auto" />;

  const handleAttendeesChange = (attendees: AttendeeDto[]) => {
    setValue('invitedAttendees', attendees, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<AttendeeDto[]> => {
    const result = await searchAttendees(value);
    return result.filter((r) => r.username !== user?.username);
  };

  const handleGroupsChange = (groups: MultipleSelectorGroup[]) => {
    setValue('invitedGroups', groups, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <FormField
          name="name"
          defaultValue={getValues('name')}
          form={form}
          labelTranslationId={t('conferences.name')}
          disabled={searchGroupsIsLoading}
          variant="dialog"
        />
        <SearchUsersOrGroups
          users={watch('invitedAttendees')}
          onSearch={onAttendeesSearch}
          onUserChange={handleAttendeesChange}
          groups={watch('invitedGroups')}
          onGroupSearch={searchGroups}
          onGroupsChange={handleGroupsChange}
          variant="dialog"
        />
        <FormField
          name="password"
          defaultValue={getValues('password')}
          form={form}
          labelTranslationId={t('conferences.password')}
          type="password"
          disabled={searchGroupsIsLoading}
          variant="dialog"
        />

        <RadioGroupFormField
          control={control}
          name="isPublic"
          labelClassname="text-base font-bold text-background"
          titleTranslationId={t('conferences.isPublic')}
          items={CONFERENCES_IS_PUBLIC_FORM_VALUES}
          disabled={searchGroupsIsLoading}
        />
      </form>
    </Form>
  );
};

export default CreateConferenceDialogBody;
