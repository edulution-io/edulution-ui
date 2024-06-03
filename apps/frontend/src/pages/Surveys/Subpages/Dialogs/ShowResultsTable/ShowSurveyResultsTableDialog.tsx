import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import { Survey } from '@/pages/Surveys/Subpages/components/types/survey';
import useShowSurveyResultsTableDialogStore from '@/pages/Surveys/Subpages/Dialogs/ShowResultsTable/ShowSurveyResultsTableDialogStore';
import SurveyResultsTable from "@/pages/Surveys/Subpages/Dialogs/ShowResultsTable/SurveyResultsTable.tsx";
import LoadingIndicator from "@/components/shared/LoadingIndicator.tsx";

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

  if (!survey) {
    return null;
  }

  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;

    if (!survey?.survey) return <div>{t('survey.noFormula')}</div>;

    return (
      <ScrollArea>
        <SurveyResultsTable
          surveyFormula={survey.survey}
          answers={answers}
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
      isOpen={isOpenSurveyResultsTableDialog}
      trigger={trigger}
      handleOpenChange={isOpenSurveyResultsTableDialog ? closeSurveyResultsTableDialog : openSurveyResultsTableDialog}
      title={t('survey.resulting')}
      body={getDialogBody()}
      // desktopContentClassName="min-h-[75%] max-w-[85%]"
    />
  );
};

export default ShowSurveyResultsTableDialog;
