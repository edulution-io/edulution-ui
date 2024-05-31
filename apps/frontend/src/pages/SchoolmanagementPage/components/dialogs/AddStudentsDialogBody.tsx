import React from 'react';
import { Form } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import useUserStore from '@/store/userStore';
import useSchoolManagementStore from '@/pages/SchoolmanagementPage/store/schoolManagementStore.ts';

interface AddConferenceDialogBodyProps {
  form: UseFormReturn<any>;
}

const AddConferenceDialogBody = ({ form }: AddConferenceDialogBodyProps) => {
  const { setValue, getValues } = form;
  const { user } = useUserStore();
  const { searchAttendees } = useSchoolManagementStore();

  const handleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('invitedAttendees', attendees, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<Attendee[]> => {
    const result = await searchAttendees(value);
    return result.filter((r) => r.username !== user);
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <SearchUsersOrGroups
          value={getValues('invitedAttendees') as Attendee[]}
          onSearch={onAttendeesSearch}
          onChange={handleAttendeesChange}
        />
      </form>
    </Form>
  );
};

export default AddConferenceDialogBody;
