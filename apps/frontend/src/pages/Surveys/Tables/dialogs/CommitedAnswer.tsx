import React from 'react';
import CommitedAnswersDialog from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialog';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import useCommitedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialogStore';

const CommitedAnswer = () => {
  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const { isOpenCommitedAnswersDialog, setIsOpenCommitedAnswersDialog, getCommittedSurveyAnswers, answer, isLoading } =
    useCommitedAnswersDialogStore();

  if (!survey) {
    return null;
  }

  return (
    <CommitedAnswersDialog
      surveyId={survey?.id}
      surveyJSON={survey?.formula}
      answerJSON={answer}
      isOpenCommitedAnswersDialog={isOpenCommitedAnswersDialog}
      setIsOpenCommitedAnswersDialog={setIsOpenCommitedAnswersDialog}
      getUsersCommitedAnswer={getCommittedSurveyAnswers}
      isLoading={isLoading}
    />
  );
};

export default CommitedAnswer;
