import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import ResultVisualization from '@/pages/Surveys/Tables/components/ResultVisualization';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';

const ResultVisualizationDialogBody = () => {
  const { selectedSurvey } = useSurveyTablesPageStore();
  const { setIsOpenPublicResultsVisualisationDialog, getSurveyResult, result } = useResultDialogStore();

  const { t } = useTranslation();

  useEffect((): void => {
    if (selectedSurvey) {
      void getSurveyResult(selectedSurvey.id);
    }
  }, [selectedSurvey]);

  useEffect(() => {
    if (!selectedSurvey?.formula) {
      toast.error(t(SurveyErrorMessages.NoFormula));
      setIsOpenPublicResultsVisualisationDialog(false);
    } else if (result && result.length === 0) {
      setIsOpenPublicResultsVisualisationDialog(false);
    }
  }, [selectedSurvey, result]);

  if (!selectedSurvey?.formula || !result || result.length === 0) {
    return null;
  }

  return (
    <ResultVisualization
      formula={selectedSurvey.formula as unknown as JSON}
      result={result}
    />
  );
};

export default ResultVisualizationDialogBody;
