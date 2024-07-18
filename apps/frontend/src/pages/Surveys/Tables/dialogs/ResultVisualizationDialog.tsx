import React, { useEffect } from 'react';
import mongoose from 'mongoose';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import SurveyDto from '@libs/survey/types/survey.dto';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ResultVisualizationDialogBody from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialogBody';

interface ResultVisualizationDialogProps {
  survey: SurveyDto;

  isOpenPublicResultsVisualisationDialog: boolean;
  setIsOpenPublicResultsVisualisationDialog: (state: boolean) => void;
  getSurveyResult: (surveyId: mongoose.Types.ObjectId) => Promise<void>;
  result: JSON[] | undefined;
  isLoadingResult: boolean;
  error: Error | null;

  trigger?: React.ReactNode;
}

const ResultVisualizationDialog = (props: ResultVisualizationDialogProps) => {
  const {
    survey,
    isOpenPublicResultsVisualisationDialog,
    setIsOpenPublicResultsVisualisationDialog,
    getSurveyResult,
    result,
    isLoadingResult,
    error,
    trigger,
  } = props;

  const { t } = useTranslation();

  useEffect((): void => {
    if (survey && isOpenPublicResultsVisualisationDialog) {
      void getSurveyResult(survey.id);
    }
  }, [isOpenPublicResultsVisualisationDialog, survey]);

  const getDialogBody = () => {
    if (isLoadingResult) return <LoadingIndicator isOpen={isLoadingResult} />;

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
        {error ? toast.error(t(error.message)) : null}
      </ScrollArea>
    );
  };

  if (!isOpenPublicResultsVisualisationDialog) {
    return null;
  }

  return (
    <AdaptiveDialog
      isOpen={isOpenPublicResultsVisualisationDialog}
      trigger={trigger}
      handleOpenChange={() => setIsOpenPublicResultsVisualisationDialog(!isOpenPublicResultsVisualisationDialog)}
      title={t('surveys.resultChartDialog.title')}
      body={getDialogBody()}
    />
  );
};

export default ResultVisualizationDialog;
