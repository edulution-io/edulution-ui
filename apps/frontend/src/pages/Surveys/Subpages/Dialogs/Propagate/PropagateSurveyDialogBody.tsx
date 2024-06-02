import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import useUserStore from '@/store/userStore';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import usePropagateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Propagate/PropagateSurveyDialogStore';
import { RadioGroupSH } from '@/components/ui/RadioGroupSH';

interface EditSurveyDialogBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const PropagateSurveyDialogBody = (props: EditSurveyDialogBodyProps) => {
  const {
    form, // saveSurveyLocally
  } = props;
  const { isPropagating, searchAttendees } = usePropagateSurveyDialogStore();
  const { user } = useUserStore();

  if (isPropagating) return <div>Loading...</div>;

  const handleAttendeesChange = (attendees: MultipleSelectorOptionSH[] = []) => {
    const newParticipants = attendees.map((option) => ({
      label: option.label,
      value: option.value,
    }));
    form.setValue('participants', newParticipants, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<Attendee[]> => {
    const result = await searchAttendees(value);
    return result.filter((r) => r.username !== user);
  };

  return (
    <>
      <RadioGroupSH />
      <SearchUsersOrGroups
        value={form.getValues('participants')}
        onSearch={onAttendeesSearch}
        onChange={handleAttendeesChange}
      />
    </>
  );
};

export default PropagateSurveyDialogBody;
