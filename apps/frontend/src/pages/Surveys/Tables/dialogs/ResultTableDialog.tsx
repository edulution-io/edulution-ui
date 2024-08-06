import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import ResultTableDialogBody from '@/pages/Surveys/Tables/dialogs/ResultTableDialogBody';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import './resultTableDialog.css';

const ResultTableDialog = () => {
  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const { isOpenPublicResultsTableDialog, setIsOpenPublicResultsTableDialog, getSurveyResult, result, isLoading } =
    useResultDialogStore();

  const { t } = useTranslation();

  useEffect((): void => {
    if (survey && isOpenPublicResultsTableDialog) {
      void getSurveyResult(survey.id);
    }
  }, [isOpenPublicResultsTableDialog, survey]);

  if (!isOpenPublicResultsTableDialog) {
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
    <ScrollArea className="overflow-x-auto overflow-y-auto">
      <ResultTableDialogBody
        formula={survey.formula}
        result={result}
      />
    </ScrollArea>
  );

  return isOpenPublicResultsTableDialog ? (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      <AdaptiveDialog
        isOpen={isOpenPublicResultsTableDialog}
        handleOpenChange={() => setIsOpenPublicResultsTableDialog(!isOpenPublicResultsTableDialog)}
        title={t('surveys.resultTableDialog.title')}
        body={getDialogBody()}
        desktopContentClassName="max-h-[75vh] max-w-[85%]"
      />
    </>
  ) : null;
};

export default ResultTableDialog;
