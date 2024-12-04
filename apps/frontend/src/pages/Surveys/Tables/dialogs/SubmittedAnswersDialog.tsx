import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import SubmittedAnswersDialogBody from '@/pages/Surveys/Tables/dialogs/SubmittedAnswersDialogBody';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useSubmittedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/useSubmittedAnswersDialogStore';

const SubmittedAnswersDialog = () => {
  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const {
    isOpenSubmittedAnswersDialog,
    setIsOpenSubmittedAnswersDialog,
    getSubmittedSurveyAnswers,
    answer,
    isLoading,
  } = useSubmittedAnswersDialogStore();

  const surveyId = survey?.id;
  const surveyJSON = survey?.formula;

  const { t } = useTranslation();

  useEffect((): void => {
    if (isOpenSubmittedAnswersDialog && surveyId) {
      void getSubmittedSurveyAnswers(surveyId);
    }
  }, [isOpenSubmittedAnswersDialog, surveyId]);

  const getDialogBody = () => {
    // TODO: NIEDUUI-222: Add a user selection to show answers of a selected user when current user is admin
    if (!surveyJSON) {
      return <h4 className="transform(-50%,-50%) absolute right-1/2 top-1/2">{t('survey.notFound')}</h4>;
    }
    return (
      <ScrollArea>
        <SubmittedAnswersDialogBody
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
        isOpen={isOpenSubmittedAnswersDialog}
        handleOpenChange={() => setIsOpenSubmittedAnswersDialog(!isOpenSubmittedAnswersDialog)}
        title={t('surveys.submittedAnswersDialog.title')}
        body={getDialogBody()}
        desktopContentClassName="max-w-[75%]"
      />
    </>
  );
};

export default SubmittedAnswersDialog;
