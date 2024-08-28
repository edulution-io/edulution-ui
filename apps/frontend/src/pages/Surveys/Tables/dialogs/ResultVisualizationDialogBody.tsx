import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import SurveyErrorMessagesEnum from '@libs/survey/constants/api/survey-error-messages-enum';
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

  if (!selectedSurvey?.formula) {
    toast.error(t(SurveyErrorMessagesEnum.NoFormula));
    setIsOpenPublicResultsVisualisationDialog(false);
    return null;
  }

  if (!result) {
    return null;
  }

  if (result && result.length === 0) {
    toast.error(t(SurveyErrorMessagesEnum.NoAnswers));
    setIsOpenPublicResultsVisualisationDialog(false);
    return null;
  }

  return (
    <ResultVisualization
      formula={selectedSurvey.formula}
      result={result}
    />
  );
};

export default ResultVisualizationDialogBody;
