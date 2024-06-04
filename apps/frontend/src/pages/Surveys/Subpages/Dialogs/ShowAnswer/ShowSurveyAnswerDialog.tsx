import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { Survey } from '@/pages/Surveys/Subpages/components/types/survey';
import SurveySubmission from '@/pages/Surveys/Subpages/Dialogs/ShowAnswer/SurveySubmission';
import useShowSurveyAnswerDialogStore from '@/pages/Surveys/Subpages/Dialogs/ShowAnswer/ShowSurveyAnswerDialogStore';

interface ShowSurveyAnswerDialogProps {
  survey?: Survey;
  trigger?: React.ReactNode;
}

const ShowSurveyAnswerDialog = (props: ShowSurveyAnswerDialogProps) => {
  const { survey, trigger } = props;
  const {
    isOpenSurveyAnswerDialog,
    openSurveyAnswerDialog,
    closeSurveyAnswerDialog,
    isLoading,
    error,
    answer,
    getSurveyAnswer,
  } = useShowSurveyAnswerDialogStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (!survey) return;
    if (!isOpenSurveyAnswerDialog) return;
    getSurveyAnswer(survey?.surveyname);
  }, [survey, isOpenSurveyAnswerDialog]);

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
            {'Survey Error'}: {error.message}
          </div>
        ) : null}
      </ScrollArea>
    );
  };
  return (
    <AdaptiveDialog
      isOpen={isOpenSurveyAnswerDialog}
      trigger={trigger}
      handleOpenChange={isOpenSurveyAnswerDialog ? closeSurveyAnswerDialog : openSurveyAnswerDialog}
      title={t('survey.answer')}
      body={getDialogBody()}
      desktopContentClassName="max-w-[75%]"
    />
  );
};

export default ShowSurveyAnswerDialog;
