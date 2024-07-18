import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineArrowDownOnSquare } from 'react-icons/hi2';
import CommitedAnswersDialog from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialog';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import useCommitedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialogStore';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

const CommitedAnswer = () => {
  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const { isOpenCommitedAnswersDialog, setIsOpenCommitedAnswersDialog, getCommittedSurveyAnswers, answer, isLoading } =
    useCommitedAnswersDialogStore();

  const { t } = useTranslation();

  if (!survey) {
    return null;
  }

  return (
    <>
      <FloatingActionButton
        icon={HiOutlineArrowDownOnSquare}
        text={t('surveys.actions.showCommittedAnswers')}
        onClick={() => setIsOpenCommitedAnswersDialog(true)}
      />
      <CommitedAnswersDialog
        surveyId={survey?.id}
        surveyJSON={survey?.formula}
        answerJSON={answer}
        isOpenCommitedAnswersDialog={isOpenCommitedAnswersDialog}
        setIsOpenCommitedAnswersDialog={setIsOpenCommitedAnswersDialog}
        getUsersCommitedAnswer={getCommittedSurveyAnswers}
        isLoading={isLoading}
      />
    </>
  );
};

export default CommitedAnswer;
