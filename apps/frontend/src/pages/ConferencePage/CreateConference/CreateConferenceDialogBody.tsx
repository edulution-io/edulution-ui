import React from 'react';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import Attendee from '@libs/users-attendees/types/attendee';
import useUserStore from '@/store/UserStore/UserStore';

interface CreateConferenceDialogBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const CreateConferenceDialogBody = ({ form }: CreateConferenceDialogBodyProps) => {
  const { setValue, getValues } = form;
  const { username } = useUserStore();
  const { isLoading, searchAttendees } = useCreateConferenceDialogStore();
  const { t } = useTranslation();

  if (isLoading) return <div>Loading...</div>;

  const handleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('invitedAttendees', attendees, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<Attendee[]> => {
    const result = await searchAttendees(value);
    return result.filter((r) => r.username !== username);
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
          form={form}
          labelTranslationId={t('conferences.name')}
          isLoading={isLoading}
          variant="default"
        />
        <FormField
          name="password"
          form={form}
          labelTranslationId={t('conferences.password')}
          type="password"
          isLoading={isLoading}
          variant="default"
        />
        <SearchUsersOrGroups
          value={getValues('invitedAttendees') as Attendee[]}
          onSearch={onAttendeesSearch}
          onChange={handleAttendeesChange}
        />
      </form>
    </Form>
  );
};

export default CreateConferenceDialogBody;
