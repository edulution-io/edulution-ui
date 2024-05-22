import React from 'react';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import useUserStore from '@/store/userStore';
import useEditSurveyDialogStore from '@/pages/Survey/components/edit-dialog/EditSurveyDialogStore';
import EditSurvey from '@/pages/Survey/components/edit-dialog/EditSurvey';

const EditSurveyDialogBody = (/* { form }: EditSurveyDialogBodyProps */) => {
  const { user } = useUserStore();
  const { isLoading, searchAttendees, participants, setParticipants } = useEditSurveyDialogStore();

  if (isLoading) return <div>Loading...</div>;

  const handleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    const newParticipants = attendees.map((option) => ({
      label: option.label,
      value: option.value,
    }));
    setParticipants(newParticipants as Attendee[]);
  };

  const onAttendeesSearch = async (value: string): Promise<Attendee[]> => {
    const result = await searchAttendees(value);
    return result.filter((r) => r.username !== user);
  };

  return (
    <>
      <SearchUsersOrGroups
        value={participants}
        onSearch={onAttendeesSearch}
        onChange={handleAttendeesChange}
      />
      <EditSurvey />
    </>
  );
};

export default EditSurveyDialogBody;
