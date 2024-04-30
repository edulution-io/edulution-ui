import React from 'react';
import { TableBody } from '@/components/ui/Table';
import { Participant, PollSelection, PollType } from '@/pages/Survey/Poll/poll-types';
import PreviousParticipantsRow from '@/pages/Survey/Poll/components/TableBody/PreviousParticipantsRow';
import CurrentParticipantRow from '@/pages/Survey/Poll/components/TableBody/CurrentParticipantRow';

interface PollBodyProps {
  pollType: PollType;
  pollName: string;

  participants: Participant[];

  currentSelection: PollSelection[];
  setCurrentSelection: (selection: PollSelection[]) => void;

  currentParticipantName: string;
  setCurrentParticipantName: (currentParticipantName: string) => void;

  canParticipantSelectMultipleOptions: boolean;
}

const PollBody = (props: PollBodyProps) => {
  const {
    pollType,
    pollName,

    participants,

    currentSelection,
    setCurrentSelection,

    currentParticipantName,
    setCurrentParticipantName,

    canParticipantSelectMultipleOptions,
  } = props;

  return (
    <TableBody>
      {participants.map((participant: Participant) => (
        <PreviousParticipantsRow
          key={`poll_${pollName}_table_row_participant_${participant.displayText}`}
          displayText={participant.displayText}
          selection={participant.selection}
          className="bg-gray-700 hover:bg-gray-800"
        />
      ))}
      <CurrentParticipantRow
        pollType={pollType}
        pollName={pollName}
        currentParticipantName={currentParticipantName}
        setCurrentParticipantName={setCurrentParticipantName}
        currentSelection={currentSelection}
        setCurrentSelection={setCurrentSelection}
        canParticipantSelectMultipleOptions={canParticipantSelectMultipleOptions}
      />
    </TableBody>
  );
};

export default PollBody;
