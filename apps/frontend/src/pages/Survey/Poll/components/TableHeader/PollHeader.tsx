import React from 'react';
import { Participant, PollSelection, PollType } from '@/pages/Survey/Poll/poll-types';
import StaticHeader from '@/pages/Survey/Poll/components/TableHeader/StaticHeader';
import DynamicHeader from '@/pages/Survey/Poll/components/TableHeader/DynamicHeader';

interface PollHeaderProps {
  pollType: PollType;
  pollName: string;

  participants: Participant[];

  currentOptions: string[] | Date[] | number[];
  setCurrentOptions: (options: string[] | Date[] | number[]) => void;

  newOption: string | Date[] | undefined;
  setNewOption: (option: string | Date[] | undefined) => void;

  currentSelection: PollSelection[];
  setCurrentSelection: (selection: PollSelection[]) => void;

  canParticipantsAddOptions?: boolean;
}

const PollHeader = (props: PollHeaderProps) => {
  const {
    pollType,
    pollName,

    currentOptions,
    setCurrentOptions,

    participants,

    currentSelection,
    setCurrentSelection,

    newOption,
    setNewOption,

    canParticipantsAddOptions = false,
  } = props;

  if (canParticipantsAddOptions) {
    return (
      <DynamicHeader
        pollType={pollType}
        pollName={pollName}
        currentOptions={currentOptions}
        setCurrentOptions={setCurrentOptions}
        participants={participants}
        currentSelection={currentSelection}
        setCurrentSelection={setCurrentSelection}
        newOption={newOption}
        setNewOption={setNewOption}
      />
    );
  }
  return (
    <StaticHeader
      pollType={pollType}
      pollName={pollName}
      currentOptions={currentOptions}
    />
  );
};

export default PollHeader;
