import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import useEditPollDialogStore from '@/pages/PollsAndSurveysPage/Polls/dialogs/create-edit-poll/EditPollDialogStore';
import PollEditor from '@/pages/PollsAndSurveysPage/Polls/dialogs/create-edit-poll/PollEditor';

interface EditPollDialogBodyProps {
  userName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const EditPollDialogBody = (props: EditPollDialogBodyProps) => {
  const { userName, form } = props;
  const { isSaving, searchAttendees } = useEditPollDialogStore();

  if (isSaving) return <div>Loading...</div>;

  const handleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    const newParticipants = attendees.map((option) => ({
      label: option.label,
      value: option.value,
    }));
    form.setValue('participants', newParticipants, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<Attendee[]> => {
    const result = await searchAttendees(value);
    return result.filter((r) => r.username !== userName);
  };

  return (
    <>
      <SearchUsersOrGroups
        value={form.getValues('participants')}
        onSearch={onAttendeesSearch}
        onChange={handleAttendeesChange}
      />
      <PollEditor form={form} />
    </>
  );
};

export default EditPollDialogBody;