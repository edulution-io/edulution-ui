import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import ResultTable from '@/pages/Surveys/Tables/components/ResultTable';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import './resultTableDialog.css';

const ResultTableDialogBody = () => {
  const { selectedSurvey } = useSurveyTablesPageStore();
  const { setIsOpenPublicResultsTableDialog, getSurveyResult, result } = useResultDialogStore();

  const { t } = useTranslation();

  useEffect((): void => {
    if (selectedSurvey) {
      void getSurveyResult(selectedSurvey.id);
    }
  }, [selectedSurvey]);

  useEffect(() => {
    if (!selectedSurvey?.formula) {
      toast.error(t(SurveyErrorMessages.NoFormula));
      setIsOpenPublicResultsTableDialog(false);
    } else if (result && result.length === 0) {
      setIsOpenPublicResultsTableDialog(false);
    }
  }, [selectedSurvey, result]);

  if (!selectedSurvey?.formula || !result || result.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="overflow-x-auto overflow-y-auto">
      <ResultTable
        formula={selectedSurvey.formula}
        result={result}
      />
    </ScrollArea>
  );
};

export default ResultTableDialogBody;
