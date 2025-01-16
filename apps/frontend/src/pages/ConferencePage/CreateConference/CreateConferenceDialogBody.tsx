import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import useUserStore from '@/store/UserStore/UserStore';
import CircleLoader from '@/components/ui/CircleLoader';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import useGroupStore from '@/store/GroupStore';
import RadioGroupFormField from '@/components/shared/RadioGroupFormField';
import CONFERENCES_IS_PUBLIC_FORM_VALUES from '@libs/conferences/constants/isPublicFormValues';

interface CreateConferenceDialogBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const CreateConferenceDialogBody = ({ form }: CreateConferenceDialogBodyProps) => {
  const { setValue, watch } = form;
  const { user, searchAttendees } = useUserStore();
  const { isLoading } = useCreateConferenceDialogStore();
  const { searchGroups, searchGroupsIsLoading } = useGroupStore();
  const { t } = useTranslation();

  if (isLoading) return <CircleLoader className="mx-auto" />;

  const handleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('invitedAttendees', attendees, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<AttendeeDto[]> => {
    const result = await searchAttendees(value);
    return result.filter((r) => r.username !== user?.username);
  };

  const handleGroupsChange = (groups: MultipleSelectorOptionSH[]) => {
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
          defaultValue={form.getValues('name') as string}
          form={form}
          labelTranslationId={t('conferences.name')}
          disabled={searchGroupsIsLoading}
          variant="dialog"
        />
        <SearchUsersOrGroups
          users={watch('invitedAttendees') as AttendeeDto[]}
          onSearch={onAttendeesSearch}
          onUserChange={handleAttendeesChange}
          groups={watch('invitedGroups') as MultipleSelectorGroup[]}
          onGroupSearch={searchGroups}
          onGroupsChange={handleGroupsChange}
          variant="dialog"
        />
        <FormField
          name="password"
          defaultValue={form.getValues('password') as string}
          form={form}
          labelTranslationId={t('conferences.password')}
          type="password"
          disabled={searchGroupsIsLoading}
          variant="dialog"
        />

        <RadioGroupFormField
          control={form.control}
          name="isPublic"
          labelClassname="text-base font-bold text-background"
          titleTranslationId={t('conferences.isPublic')}
          defaultValue={CONFERENCES_IS_PUBLIC_FORM_VALUES[0].value}
          items={CONFERENCES_IS_PUBLIC_FORM_VALUES}
          disabled={searchGroupsIsLoading}
        />
      </form>
    </Form>
  );
};

export default CreateConferenceDialogBody;
