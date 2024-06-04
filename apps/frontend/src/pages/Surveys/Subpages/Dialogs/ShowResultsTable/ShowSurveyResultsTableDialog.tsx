import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import { Survey } from '@/pages/Surveys/Subpages/components/types/survey';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import SurveyTableVisualization
  from '@/pages/Surveys/Subpages/Dialogs/ShowResultsTable/SurveyTableVisualization';
import useShowSurveyResultsTableDialogStore
  from '@/pages/Surveys/Subpages/Dialogs/ShowResultsTable/ShowSurveyResultsTableDialogStore';

interface ShowSurveyResultsTableDialogProps {
  survey: Survey;
  trigger?: React.ReactNode;
}

const ShowSurveyResultsTableDialog = (props: ShowSurveyResultsTableDialogProps) => {
  const { survey, trigger } = props;
  const {
    isOpenSurveyResultsTableDialog,
    openSurveyResultsTableDialog,
    closeSurveyResultsTableDialog,
    error,
    answers,
    getAllSurveyAnswers,
    isLoading,
  } = useShowSurveyResultsTableDialogStore();

  const { t } = useTranslation();

  useEffect(() => {
    const fetchAnswers = async () => {
      await getAllSurveyAnswers(survey?.surveyname, survey?.participants);
    }

    if (!survey) return;
    if (!isOpenSurveyResultsTableDialog) return;

    fetchAnswers();

  }, [survey, isOpenSurveyResultsTableDialog]);

  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;

    if (!survey?.survey) return <div>{t('survey.noFormula')}</div>;

    if (!answers || answers.length == 0) return <div>{t('survey.noAnswer')}</div>;

    return (
      <ScrollArea className="overflow-y-auto overflow-x-auto">
        <SurveyTableVisualization
          surveyFormula={survey.survey}
          answers={answers.map((answer) => JSON.parse(answer))}
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
      isOpen={isOpenSurveyResultsTableDialog}
      trigger={trigger}
      handleOpenChange={isOpenSurveyResultsTableDialog ? closeSurveyResultsTableDialog : openSurveyResultsTableDialog}
      title={t('survey.resultingVisualization')}
      body={getDialogBody()}
      desktopContentClassName="max-h-[75vh] max-w-[85%]"
    />
  );
};

export default ShowSurveyResultsTableDialog;
