import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ResultVisualizationDialogBody from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialogBody';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/ResultStore';

const ResultVisualizationDialog = () => {
  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const {
    isOpenPublicResultsVisualisationDialog,
    setIsOpenPublicResultsVisualisationDialog,
    getSurveyResult,
    result,
    isLoading,
  } = useResultDialogStore();

  const { t } = useTranslation();

  useEffect((): void => {
    if (survey && isOpenPublicResultsVisualisationDialog) {
      void getSurveyResult(survey.id);
    }
  }, [isOpenPublicResultsVisualisationDialog, survey]);

  const getDialogBody = () => {
    if (!survey?.formula) {
      return (
        <div className="rounded-xl bg-red-400 py-3 text-center text-foreground">
          <div>{t('survey.noFormula')}</div>
        </div>
      );
    }
    if (!result || result.length === 0) {
      return (
        <div className="rounded-xl bg-red-400 py-3 text-center text-foreground">
          <div>{t('survey.noAnswer')}</div>
        </div>
      );
    }

    return (
      <ScrollArea>
        <ResultVisualizationDialogBody
          formula={survey.formula}
          result={result}
        />
      </ScrollArea>
    );
  };

  return isOpenPublicResultsVisualisationDialog ? (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      <AdaptiveDialog
        isOpen={isOpenPublicResultsVisualisationDialog}
        handleOpenChange={() => setIsOpenPublicResultsVisualisationDialog(!isOpenPublicResultsVisualisationDialog)}
        title={t('surveys.resultChartDialog.title')}
        body={getDialogBody()}
      />
    </>
  ) : null;
};

export default ResultVisualizationDialog;