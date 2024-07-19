import React from 'react';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
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
  } = useResultDialogStore();

  if (!survey) {
    return null;
  }

  return (
    <ResultVisualizationDialog
      survey={survey}
      isOpenPublicResultsVisualisationDialog={isOpenPublicResultsVisualisationDialog}
      setIsOpenPublicResultsVisualisationDialog={setIsOpenPublicResultsVisualisationDialog}
      getSurveyResult={getSurveyResult}
      result={result}
      isLoading={isLoading}
    />
  );
};

export default ResultVisualization;
