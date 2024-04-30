import React from 'react';
import { PollType } from '@/pages/Survey/Poll/poll-types';
import PollTable from '@/pages/Survey/Poll/components/PollTable';
import { mockedOptions, mockedParticipants } from '@/pages/Survey/Poll/poll-values-mocked';

const PollEditor = () => (
  // const [participants, setParticipants] = React.useState<Participant[]>([]);
  // TODO: Add the function to select a group/class as participants
  <>
    <div className="mb-10 mt-10">
      <PollTable
        pollType={PollType.TEXT}
        pollName="MockedTextPoll"
        participants={mockedParticipants}
        options={mockedOptions}
        canParticipantsAddOptions={false}
        canParticipantSelectMultipleOptions
      />
    </div>

    <div className="mb-10 mt-10">
      <PollTable
        pollType={PollType.DATE}
        pollName="MockedDatePoll"
        canParticipantsAddOptions
        canParticipantSelectMultipleOptions
      />
    </div>
  </>
);

export default PollEditor;
