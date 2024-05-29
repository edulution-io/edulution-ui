import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea.tsx';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog.tsx';
import LoadingIndicator from '@/components/shared/LoadingIndicator.tsx';
import useShowSurveyAnswerDialogStore from '@/pages/PollsAndSurveysPage/Surveys/dialogs/show-submitted-answer/ShowSurveyAnswerDialogStore.tsx';
import { Survey } from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/model';
import SurveySubmission from '@/pages/PollsAndSurveysPage/Surveys/dialogs/show-submitted-answer/SurveySubmission';

interface ShowSurveyAnswerDialogProps {
  isOpenSurveyResultsDialog: boolean;
  openSurveyResultsDialog: () => void;
  closeSurveyResultsDialog: () => void;
  survey?: Survey;
  trigger?: React.ReactNode;
}

const ShowSurveyAnswerDialog = (props: ShowSurveyAnswerDialogProps) => {
  const { isOpenSurveyResultsDialog, openSurveyResultsDialog, closeSurveyResultsDialog, survey, trigger } = props;
  const { isLoading, error, answer, getSurveyAnswer } = useShowSurveyAnswerDialogStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (!survey) return;
    if (!isOpenSurveyResultsDialog) return;
    getSurveyAnswer(survey?.surveyname);
  }, [survey, isOpenSurveyResultsDialog]);

  if (!survey) {
    return null;
  }

  if (!answer) {
    return null;
  }

  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
    return (
      <ScrollArea>
        <SurveySubmission
          surveyFormula={survey.survey}
          answer={answer}
        />
        {error ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {t('survey.error')}: {error.message}
          </div>
        ) : null}
      </ScrollArea>
    );
  };
  return (
    <AdaptiveDialog
      isOpen={isOpenSurveyResultsDialog}
      trigger={trigger}
      handleOpenChange={isOpenSurveyResultsDialog ? closeSurveyResultsDialog : openSurveyResultsDialog}
      title={t('survey.resulting')}
      body={getDialogBody()}
      desktopContentClassName="max-w-[75%]"
    />
  );
};

export default ShowSurveyAnswerDialog;
