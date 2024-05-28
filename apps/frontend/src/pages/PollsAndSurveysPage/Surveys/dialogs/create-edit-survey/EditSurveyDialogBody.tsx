import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import SurveyEditor from '@/pages/PollsAndSurveysPage/Surveys/dialogs/create-edit-survey/SurveyEditor.tsx';
import useEditSurveyDialogStore
  from '@/pages/PollsAndSurveysPage/Surveys/dialogs/create-edit-survey/EditSurveyDialogStore';

interface EditSurveyDialogBodyProps {
  userName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const EditSurveyDialogBody = (props: EditSurveyDialogBodyProps) => {
  const { userName, form, // saveSurveyLocally
  } = props;
  const { isSaving, searchAttendees } = useEditSurveyDialogStore();

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
        value={form.getValues("participants")}
        onSearch={onAttendeesSearch}
        onChange={handleAttendeesChange}
      />
      <SurveyEditor
        form={form}
      />
    </>
  );
};

export default EditSurveyDialogBody;
