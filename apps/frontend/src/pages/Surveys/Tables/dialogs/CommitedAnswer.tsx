import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineArrowDownOnSquare } from 'react-icons/hi2';
import CommitedAnswersDialog from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialog';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import useCommitedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialogStore';
import FloatingActionButton from '@/components/shared/FloatingActionButton';

const CommitedAnswer = () => {
  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const {
    isOpenCommitedAnswersDialog,
    openCommitedAnswersDialog,
    closeCommitedAnswersDialog,
    getUsersCommitedAnswer,
    answer,
    isLoading,
    error,
  } = useCommitedAnswersDialogStore();

  const { t } = useTranslation();

  if (!survey) {
    return null;
  }

  return (
    <>
      <FloatingActionButton
        icon={HiOutlineArrowDownOnSquare}
        text={t('surveys.actions.showCommittedAnswers')}
        onClick={openCommitedAnswersDialog}
      />
      <CommitedAnswersDialog
        survey={survey}
        isOpenCommitedAnswersDialog={isOpenCommitedAnswersDialog}
        openCommitedAnswersDialog={openCommitedAnswersDialog}
        closeCommitedAnswersDialog={closeCommitedAnswersDialog}
        getUsersCommitedAnswer={getUsersCommitedAnswer}
        // user={user}
        // selectUser={selectUser}
        answer={answer}
        isLoadingAnswer={isLoading}
        errorLoadingAnswer={error}
      />
    </>
  );
};

export default CommitedAnswer;