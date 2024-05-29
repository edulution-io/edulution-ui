import React from 'react';
import { useTranslation } from 'react-i18next';
import UsersPollsTypes from '@/pages/PollsAndSurveysPage/Polls/backend-copy/users-polls-types-enum.dto.ts';
import usePollPageStore from '@/pages/PollsAndSurveysPage/Polls/PollPageStore';
import PollSection from '@/pages/PollsAndSurveysPage/Polls/components/PollSection';
import ParticipatePollDialog from '@/pages/PollsAndSurveysPage/Polls/dialogs/participate-poll/ParticipatePollDialog';
import EditPollDialog from '@/pages/PollsAndSurveysPage/Polls/dialogs/create-edit-poll/EditPollDialog';
import PollResultsDialog from '@/pages/PollsAndSurveysPage/Polls/dialogs/show-results/PollResultsDialog';
import FloatingButtonsBarPollManagement from '@/pages/PollsAndSurveysPage/Polls/components/FloatingButtonsBarPollManagement';
import { ScrollArea } from '@/components/ui/ScrollArea.tsx';

const PollPage = () => {
  const { t } = useTranslation();

  const {
    selectedPoll,
    setSelectedPoll,
    selectedType,
    updatePollSelection,
    deletePoll,
    isOpenEditPollDialog,
    openEditPollDialog,
    closeEditPollDialog,
    isOpenParticipatePollDialog,
    openParticipatePollDialog,
    closeParticipatePollDialog,
    isOpenPollResultsDialog,
    openPollResultsDialog,
    closePollResultsDialog,
    refreshOpen,
    shouldRefreshOpen,
    refreshCreated,
    shouldRefreshCreated,
    refreshParticipated,
    shouldRefreshParticipated,
    refreshGlobalList,
    shouldRefreshGlobalList,
  } = usePollPageStore();

  return (
    <>
      <ScrollArea className="max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <PollSection
          pollType={UsersPollsTypes.OPEN}
          title={t('poll.openPolls')}
          updatePollSelection={updatePollSelection}
          shouldRefresh={refreshOpen}
        />
        <PollSection
          pollType={UsersPollsTypes.CREATED}
          title={t('poll.createdPolls')}
          updatePollSelection={updatePollSelection}
          shouldRefresh={refreshCreated}
        />
        <PollSection
          pollType={UsersPollsTypes.ANSWERED}
          title={t('poll.answeredPolls')}
          updatePollSelection={updatePollSelection}
          shouldRefresh={refreshParticipated}
        />
        <PollSection
          pollType={UsersPollsTypes.ALL}
          title={t('poll.allPolls')}
          updatePollSelection={updatePollSelection}
          shouldRefresh={refreshGlobalList}
        />
      </ScrollArea>
      <EditPollDialog
        poll={selectedPoll}
        isOpenEditPollDialog={isOpenEditPollDialog}
        openEditPollDialog={openEditPollDialog}
        closeEditPollDialog={closeEditPollDialog}
      />
      <ParticipatePollDialog
        poll={selectedPoll!}
        isOpenParticipatePollDialog={isOpenParticipatePollDialog}
        openParticipatePollDialog={openParticipatePollDialog}
        closeParticipatePollDialog={closeParticipatePollDialog}
        shouldRefreshOpen={shouldRefreshOpen}
        shouldRefreshParticipated={shouldRefreshParticipated}
      />
      <PollResultsDialog
        poll={selectedPoll!}
        isOpenPollResultsDialog={isOpenPollResultsDialog}
        openPollResultsDialog={openPollResultsDialog}
        closePollResultsDialog={closePollResultsDialog}
      />

      {/* Buttons */}
      <FloatingButtonsBarPollManagement
        selectedType={selectedType}
        deletePoll={deletePoll}
        setSelectedPoll={setSelectedPoll}
        openEditPollDialog={openEditPollDialog}
        openParticipatePollDialog={openParticipatePollDialog}
        openPollResultsDialog={openPollResultsDialog}
        shouldRefreshOpen={shouldRefreshOpen}
        shouldRefreshParticipated={shouldRefreshParticipated}
        shouldRefreshCreated={shouldRefreshCreated}
        shouldRefreshGlobalList={shouldRefreshGlobalList}
      />
    </>
  );
};

export default PollPage;
