import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import CommittedAnswersDialogBody from '@/pages/Surveys/Tables/dialogs/CommittedAnswersDialogBody';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useCommitedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/useCommitedAnswersDialogStore';

const CommittedAnswersDialog = () => {
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

  const getDialogBody = () => {
    // TODO: NIEDUUI-222: Add a user selection to show answers of a selected user when current user is admin
    if (!surveyJSON) {
      return <h4 className="transform(-50%,-50%) absolute right-1/2 top-1/2">{t('survey.notFound')}</h4>;
    }
    return (
      <ScrollArea>
        <CommittedAnswersDialogBody
          formula={surveyJSON}
          answer={answer}
        />
      </ScrollArea>
    );
  };

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

export default CommittedAnswersDialog;
