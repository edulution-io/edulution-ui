import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MdGroups } from 'react-icons/md';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';
import GroupCard from '@/pages/SchoolmanagementPage/components/GroupCard';
import {PollUpdateSelection} from "@/pages/PollsAndSurveysPage/Polls/PollPageStore.ts";
import UsersPollsTypes from "@/pages/PollsAndSurveysPage/Polls/backend-copy/users-polls-types-enum.dto.ts";

interface PollCardRowProps {
  pollType: UsersPollsTypes;
  polls?: Poll[];
  selectedPoll?: Poll;
  updatePollSelection: (selection: PollUpdateSelection) => void;
  openCreateDialog?: () => void;
  deletePoll?: (pollName: string | undefined) => Promise<void>;
  isAdmin: boolean;
}

const PollCardRow: FC<PollCardRowProps> = (props: PollCardRowProps) => {
  const { pollType, polls, selectedPoll, openCreateDialog, updatePollSelection } = props;

  const { t } = useTranslation();

  const addNewPollCard = (
    <GroupCard
      title={t('poll.create')}
      isAddNew
      onAdd={() => openCreateDialog ? openCreateDialog() : {} }
    />
  )

  return !polls || Object.keys(polls).length === 0 ? (
    <>
      <p>No poll data available. {selectedPoll?.pollName}</p>
      <div className="flex flex-wrap gap-4">
        {addNewPollCard}
      </div>
    </>
  ) : (
    <div className="flex flex-wrap gap-4">
      {Object.entries(polls).map(([pollName, poll]) => (
        <GroupCard
          key={pollName}
          icon={<MdGroups className="h-8 w-8 text-white"/>}
          title={poll.pollName}
          participants={Object.keys(poll.participants).length}
          showActions={false}
          onEdit={() => { }}
          onCopy={() => { }}
          onDelete={() => { }}
          onItemClicked={() => updatePollSelection({poll: poll, pollType: pollType})}
          isComponentSelected={selectedPoll?.pollName === pollName}
        />
      ))}
      { addNewPollCard }
    </div>
  );
};

export default PollCardRow;
