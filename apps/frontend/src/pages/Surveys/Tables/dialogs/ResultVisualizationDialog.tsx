import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import ResultVisualizationDialogBody from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialogBody';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';

const ResultVisualizationDialog = () => {
  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const {
    isOpenPublicResultsVisualisationDialog,
    setIsOpenPublicResultsVisualisationDialog,
    getSurveyResult,
    result,
    isLoading,
  } = useResultDialogStore();

  const { t } = useTranslation();

  useEffect((): void => {
    if (survey && isOpenPublicResultsVisualisationDialog) {
      void getSurveyResult(survey.id);
    }
  }, [isOpenPublicResultsVisualisationDialog, survey]);

  if (!isOpenPublicResultsVisualisationDialog) {
    return null;
  }

  if (!survey?.formula) {
    toast.error(t(SurveyErrorMessages.NoFormula));
    return null;
  }

  if (!result || result.length === 0) {
    toast.error(t(SurveyErrorMessages.NoAnswers));
    return null;
  }

  const getDialogBody = () => (
    <ResultVisualizationDialogBody
      formula={survey.formula}
      result={result}
    />
  );

  return isOpenPublicResultsVisualisationDialog ? (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      <AdaptiveDialog
        isOpen={isOpenPublicResultsVisualisationDialog}
        handleOpenChange={() => setIsOpenPublicResultsVisualisationDialog(!isOpenPublicResultsVisualisationDialog)}
        title={t('surveys.resultChartDialog.title')}
        body={getDialogBody()}
        desktopContentClassName="max-h-[75vh] max-w-[85%]"
      />
    </>
  ) : null;
};

export default ResultVisualizationDialog;
