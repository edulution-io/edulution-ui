import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineArrowDownOnSquareStack } from 'react-icons/hi2';
import ResultTableDialog from '@/pages/Surveys/Tables/dialogs/ResultTableDialog';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/ResultStore';

const ResultTable = () => {
  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const {
    isOpenPublicResultsTableDialog,
    setIsOpenPublicResultsTableDialog,
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
        text={t('surveys.actions.showResultsTable')}
        onClick={() => setIsOpenPublicResultsTableDialog(true)}
      />
      <ResultTableDialog
        survey={survey}
        isOpenPublicResultsTableDialog={isOpenPublicResultsTableDialog}
        setIsOpenPublicResultsTableDialog={setIsOpenPublicResultsTableDialog}
        getSurveyResult={getSurveyResult}
        result={result}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
};

export default ResultTable;
