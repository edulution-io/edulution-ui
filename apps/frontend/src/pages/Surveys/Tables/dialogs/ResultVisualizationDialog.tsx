import mongoose from 'mongoose';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Attendee from '@libs/survey/types/attendee';
import Survey from '@libs/survey/types/survey';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ResultVisualizationDialogBody from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialogBody';

interface ResultVisualizationDialogProps {
  survey: Survey;

  isOpenPublicResultsVisualisationDialog: boolean;
  openPublicResultsVisualisationDialog: () => void;
  closePublicResultsVisualisationDialog: () => void;
  getSurveyResult: (surveyId: mongoose.Types.ObjectId, participants: Attendee[]) => Promise<JSON[] | undefined>;
  result: JSON[];
  isLoadingResult: boolean;

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
    trigger,
  } = props;

  const { t } = useTranslation();

  const getResult = useCallback(() => {
    if (!survey) {
      return;
    }
    // eslint-disable-next-line  no-underscore-dangle
    void getSurveyResult(survey._id, survey.participants);
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
      handleOpenChange={
        isOpenPublicResultsVisualisationDialog
          ? closePublicResultsVisualisationDialog
          : openPublicResultsVisualisationDialog
      }
      title={t('surveys.resultChartDialog.title')}
      body={getDialogBody()}
      // desktopContentClassName="min-h-[75%] max-w-[85%]"
    />
  );
};

export default ResultVisualizationDialog;
