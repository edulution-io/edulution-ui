import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Survey from '@libs/survey/types/survey';
import Attendee from '@libs/conferences/types/attendee';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ResultVisualizationDialogBody from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialogBody';

interface ResultVisualizationDialogProps {
  survey: Survey;

  isOpenPublicResultsVisualisationDialog: boolean;
  openPublicResultsVisualisationDialog: () => void;
  closePublicResultsVisualisationDialog: () => void;
  getSurveyResult: (surveyId: number, participants: Attendee[]) => Promise<JSON[] | undefined>;
  result: JSON[];
  isLoadingResult: boolean;
  errorLoadingResult: Error | null;

  trigger?: React.ReactNode;
}

const ResultVisualizationDialog = (props: ResultVisualizationDialogProps) => {
  const {
    survey,
    isOpenPublicResultsVisualisationDialog,
    openPublicResultsVisualisationDialog,
    closePublicResultsVisualisationDialog,
    getSurveyResult,
    result,
    isLoadingResult,
    errorLoadingResult,
    trigger,
  } = props;

  if (!isOpenPublicResultsVisualisationDialog) {
    return null;
  }

  const { t } = useTranslation();

  const getResult = useCallback(() => {
    if (!survey) {
      return;
    }
    void getSurveyResult(survey.id, survey.participants);
  }, []);

  useEffect((): void => {
    getResult();
  }, []);

  const getDialogBody = () => {
    if (isLoadingResult) return <LoadingIndicator isOpen={isLoadingResult} />;

    if (!survey?.formula) {
      return (
        <div className="rounded-xl bg-red-400 py-3 text-center text-black">
          <div>{t('survey.noFormula')}</div>
        </div>
      );
    }
    if (!result || result.length === 0) {
      return (
        <div className="rounded-xl bg-red-400 py-3 text-center text-black">
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
        {errorLoadingResult ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            Survey Error: {errorLoadingResult.message}
          </div>
        ) : null}
      </ScrollArea>
    );
  };

  return (
    <AdaptiveDialog
      isOpen={isOpenPublicResultsVisualisationDialog}
      trigger={trigger}
      handleOpenChange={
        isOpenPublicResultsVisualisationDialog
          ? closePublicResultsVisualisationDialog
          : openPublicResultsVisualisationDialog
      }
      title={t('survey.resultingVisualization')}
      body={getDialogBody()}
      // desktopContentClassName="min-h-[75%] max-w-[85%]"
    />
  );
};

export default ResultVisualizationDialog;
