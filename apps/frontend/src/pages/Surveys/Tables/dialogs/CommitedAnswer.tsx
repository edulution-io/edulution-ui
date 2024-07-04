import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineArrowDownOnSquare } from 'react-icons/hi2';
import CommitedAnswersDialog from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialog';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import useCommitedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialogStore';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

const CommitedAnswer = () => {
  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const {
    isOpenCommitedAnswersDialog,
    openCommitedAnswersDialog,
    closeCommitedAnswersDialog,
    getCommittedSurveyAnswers,
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
        surveyId={survey?.id}
        surveyJSON={survey?.formula}
        answerJSON={answer}
        isOpenCommitedAnswersDialog={isOpenCommitedAnswersDialog}
        openCommitedAnswersDialog={openCommitedAnswersDialog}
        closeCommitedAnswersDialog={closeCommitedAnswersDialog}
        getUsersCommitedAnswer={getCommittedSurveyAnswers}
        // user={user}
        // selectUser={selectUser}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
};

export default CommitedAnswer;
