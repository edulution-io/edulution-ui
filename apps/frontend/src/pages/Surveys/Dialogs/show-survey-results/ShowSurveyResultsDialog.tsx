import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import { Survey } from '@/pages/Surveys/components/types/survey';
import SurveyVisualization from '@/pages/Surveys/Dialogs/show-survey-results/SurveyVisualization.tsx';
import useShowSurveyResultsDialogStore
  from '@/pages/Surveys/Dialogs/show-survey-results/ShowSurveyResultsDialogStore';

interface PollResultsDialogProps {
  survey: Survey;
  trigger?: React.ReactNode;
}

const ShowSurveyResultsDialog = (props: PollResultsDialogProps) => {
  const { survey, trigger } = props;
  const {
    isOpenSurveyResultsDialog,
    openSurveyResultsDialog,
    closeSurveyResultsDialog,
    error,
    answers,
    getAllSurveyAnswers,
  } = useShowSurveyResultsDialogStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (!survey) return;
    if (!isOpenSurveyResultsDialog) return;
    getAllSurveyAnswers(survey?.surveyname, survey?.participants || []);
  }, [survey, isOpenSurveyResultsDialog]);

  if (!survey) {
    return null;
  }

  const getDialogBody = () => {
    if (!survey?.survey) return <div>{t('survey.noFormula')}</div>;
    return (
      <ScrollArea>
        <SurveyVisualization
          surveyFormula={survey.survey}
          answers={answers || []}
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
      // desktopContentClassName="min-h-[75%] max-w-[85%]"
    />
  );
};

export default ShowSurveyResultsDialog;
