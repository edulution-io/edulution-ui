import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import SurveyErrorMessagesEnum from '@libs/survey/constants/api/survey-error-messages-enum';
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

  if (!selectedSurvey?.formula) {
    toast.error(t(SurveyErrorMessagesEnum.NoFormula));
    setIsOpenPublicResultsTableDialog(false);
    return null;
  }

  if (!result) {
    return null;
  }

  if (result && result.length === 0) {
    toast.error(t(SurveyErrorMessagesEnum.NoAnswers));
    setIsOpenPublicResultsTableDialog(false);
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
