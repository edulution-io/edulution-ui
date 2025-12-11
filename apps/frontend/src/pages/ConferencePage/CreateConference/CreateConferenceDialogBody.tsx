/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
