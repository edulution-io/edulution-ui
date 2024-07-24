import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import CommitedAnswersDialogBody from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialogBody';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import useCommitedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialogStore';

const CommitedAnswersDialog = () => {
  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const { isOpenCommitedAnswersDialog, setIsOpenCommitedAnswersDialog, getCommittedSurveyAnswers, answer, isLoading } =
    useCommitedAnswersDialogStore();

  const surveyId = survey?.id;
  const surveyJSON = survey?.formula;

  const { t } = useTranslation();

  useEffect((): void => {
    if (isOpenCommitedAnswersDialog && surveyId) {
      void getCommittedSurveyAnswers(surveyId);
    }
  }, [isOpenCommitedAnswersDialog, surveyId]);

  const getDialogBody = () => (
    // TODO: NIEDUUI-222: Add a user selection to show answers of a selected user when current user is admin
    <ScrollArea>
      <CommitedAnswersDialogBody
        formula={surveyJSON!}
        answer={answer!}
      />
    </ScrollArea>
  );

  return (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      <AdaptiveDialog
        isOpen={isOpenCommitedAnswersDialog}
        handleOpenChange={() => setIsOpenCommitedAnswersDialog(!isOpenCommitedAnswersDialog)}
        title={t('surveys.commitedAnswersDialog.title')}
        body={getDialogBody()}
        desktopContentClassName="max-w-[75%]"
      />
    </>
  );
};

export default CommitedAnswersDialog;
