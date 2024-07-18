import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineArrowDownOnSquareStack } from 'react-icons/hi2';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/ResultStore';
import ResultVisualizationDialog from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialog';

const ResultVisualization = () => {
  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const {
    isOpenPublicResultsVisualisationDialog,
    setIsOpenPublicResultsVisualisationDialog,
    getSurveyResult,
    result,
    isLoading,
    error,
  } = useResultDialogStore();

  const { t } = useTranslation();

  if (!survey) {
    return null;
  }

  return (
    <>
      <FloatingActionButton
        icon={HiOutlineArrowDownOnSquareStack}
        text={t('surveys.actions.showResultsChart')}
        onClick={() => setIsOpenPublicResultsVisualisationDialog(true)}
      />
      <ResultVisualizationDialog
        survey={survey}
        isOpenPublicResultsVisualisationDialog={isOpenPublicResultsVisualisationDialog}
        setIsOpenPublicResultsVisualisationDialog={setIsOpenPublicResultsVisualisationDialog}
        getSurveyResult={getSurveyResult}
        result={result}
        isLoadingResult={isLoading}
        error={error}
      />
    </>
  );
};

export default ResultVisualization;
