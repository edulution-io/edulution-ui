import React from 'react';
import ResultTableDialog from '@/pages/Surveys/Tables/dialogs/ResultTableDialog';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/ResultStore';

const ResultTable = () => {
  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const { isOpenPublicResultsTableDialog, setIsOpenPublicResultsTableDialog, getSurveyResult, result, isLoading } =
    useResultDialogStore();

  if (!survey) {
    return null;
  }

  return (
    <ResultTableDialog
      survey={survey}
      isOpenPublicResultsTableDialog={isOpenPublicResultsTableDialog}
      setIsOpenPublicResultsTableDialog={setIsOpenPublicResultsTableDialog}
      getSurveyResult={getSurveyResult}
      result={result}
      isLoading={isLoading}
    />
  );
};

export default ResultTable;
