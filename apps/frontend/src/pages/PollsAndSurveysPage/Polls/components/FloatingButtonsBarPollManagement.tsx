import React from 'react';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';
import FloatingButtonParticipatePoll from '@/pages/PollsAndSurveysPage/Polls/components/floating-buttons/Participate';
import FloatingButtonOpenPollResults from '@/pages/PollsAndSurveysPage/Polls/components/floating-buttons/OpenResults';
import FloatingButtonCreatePoll from '@/pages/PollsAndSurveysPage/Polls/components/floating-buttons/Create';
import FloatingButtonDeletePoll from '@/pages/PollsAndSurveysPage/Polls/components/floating-buttons/Delete';
import FloatingButtonEditPoll from '@/pages/PollsAndSurveysPage/Polls/components/floating-buttons/Edit';
import UsersPollsTypes from '@/pages/PollsAndSurveysPage/Polls/backend-copy/users-polls-types-enum.dto';

interface FloatingButtonsBarPollManagementProps {
  selectedType: UsersPollsTypes | undefined;
  setSelectedPoll: (selectPoll: Poll | undefined) => void;
  deletePoll: () => Promise<void>;
  openEditPollDialog: () => void;
  openParticipatePollDialog: () => void;
  openPollResultsDialog: () => void;

  shouldRefreshOpen?: (refresh: boolean) => void;
  shouldRefreshParticipated?: (refresh: boolean) => void;
  shouldRefreshCreated?: (refresh: boolean) => void;
  shouldRefreshGlobalList?: (refresh: boolean) => void;
}

const FloatingButtonsBarPollManagement = (props: FloatingButtonsBarPollManagementProps) => {
  const {
    selectedType,
    setSelectedPoll,
    deletePoll,
    openEditPollDialog,
    openParticipatePollDialog,
    openPollResultsDialog,

    shouldRefreshOpen,
    shouldRefreshParticipated,
    shouldRefreshCreated,
    shouldRefreshGlobalList,
  } = props;

  const AddButton = (
    <FloatingButtonCreatePoll
      setSelectedPoll={setSelectedPoll}
      openEditPollDialog={openEditPollDialog}
    />
  );

  const getOtherButtons = () => {
    switch (selectedType) {
      case UsersPollsTypes.OPEN:
        return <FloatingButtonParticipatePoll openParticipatePollDialog={openParticipatePollDialog} />;
      case UsersPollsTypes.ALL:
      case UsersPollsTypes.CREATED:
        return (
          <>
            <FloatingButtonParticipatePoll openParticipatePollDialog={openParticipatePollDialog} />
            <FloatingButtonEditPoll openEditPollDialog={openEditPollDialog} />
            <FloatingButtonDeletePoll
              deletePoll={deletePoll}
              shouldRefreshOpen={shouldRefreshOpen}
              shouldRefreshParticipated={shouldRefreshParticipated}
              shouldRefreshCreated={shouldRefreshCreated}
              shouldRefreshGlobalList={shouldRefreshGlobalList}
            />
          </>
        );
      case UsersPollsTypes.ANSWERED:
        return <FloatingButtonOpenPollResults openPollResultsDialog={openPollResultsDialog} />;
      default:
        return null;
    }
  };
  const OtherButtons = getOtherButtons();

  return (
    <TooltipProvider>
      <div className="fixed bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
        {AddButton}
        {OtherButtons}
      </div>
    </TooltipProvider>
  );
};

export default FloatingButtonsBarPollManagement;
