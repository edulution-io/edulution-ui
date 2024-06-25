import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineArrowDownOnSquareStack } from 'react-icons/hi2';
import ResultTableDialog from '@/pages/Surveys/Tables/dialogs/ResultTableDialog';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import useResultStore from '@/pages/Surveys/Tables/dialogs/ResultStore';

const ResultTable = () => {
  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const {
    isOpenPublicResultsTableDialog,
    openPublicResultsTableDialog,
    closePublicResultsTableDialog,
    getSurveyResult,
    result,
    isLoading,
    error,
  } = useResultStore();

  const { t } = useTranslation();

  if (!survey) {
    return null;
  }

  return (
    <>
      <FloatingActionButton
        icon={HiOutlineArrowDownOnSquareStack}
        text={t('surveys.actions.showResultsTable')}
        onClick={openPublicResultsTableDialog}
      />
      <ResultTableDialog
        survey={survey}
        isOpenPublicResultsTableDialog={isOpenPublicResultsTableDialog}
        openPublicResultsTableDialog={openPublicResultsTableDialog}
        closePublicResultsTableDialog={closePublicResultsTableDialog}
        getSurveyResult={getSurveyResult}
        result={result}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
};

export default ResultTable;
