import mongoose from 'mongoose';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Attendee from '@libs/survey/types/attendee';
import Survey from '@libs/survey/types/survey';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ResultVisualizationDialogBody from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialogBody';
import ResultTableDialogBody from '@/pages/Surveys/Tables/dialogs/ResultTableDialogBody';

interface ResultDialogProps {
  resultDialogType: 'chart' | 'table';

  survey: Survey;

  isOpenPublicResults: boolean;
  closePublicResults: () => void;
  openPublicResults: () => void;

  getSurveyResult: (surveyId: mongoose.Types.ObjectId, participants: Attendee[]) => Promise<JSON[] | undefined>;
  result: JSON[];
  isLoadingResult: boolean;
  errorLoadingResult: Error | null;

  trigger?: React.ReactNode;
}

const ResultDialog = (props: ResultDialogProps) => {
  const {
    resultDialogType,
    survey,

    isOpenPublicResults,
    closePublicResults,
    openPublicResults,

    getSurveyResult,
    result,
    isLoadingResult,
    errorLoadingResult,

    trigger,
  } = props;

  if (!isOpenPublicResults) return null;

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

  const dialogBody = useMemo(() => {
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
      <ScrollArea className="overflow-x-auto overflow-y-auto">
        {resultDialogType === 'chart' ? (
          <ResultVisualizationDialogBody
            formula={survey.formula}
            result={result}
          />
        ) : null}
        {resultDialogType === 'table' ? (
          <ResultTableDialogBody
            formula={survey.formula}
            result={result}
          />
        ) : null}
        {errorLoadingResult ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            Survey Error: {errorLoadingResult.message}
          </div>
        ) : null}
      </ScrollArea>
    );
  }, [resultDialogType, result, survey.formula]);

  // const getDialogBody = () => {
  //   return (
  //     <ScrollArea className="overflow-x-auto overflow-y-auto">
  //       { resultDialogType === 'chart'
  //         ? (
  //             <ResultVisualizationDialogBody
  //               formula={survey.formula}
  //               result={result}
  //             />
  //           )
  //         : null
  //       }
  //       { resultDialogType === 'table'
  //         ? (
  //             <ResultTableDialogBody
  //               formula={survey.formula}
  //               result={result}
  //             />
  //           )
  //         : null
  //       }
  //       {errorLoadingResult ? (
  //         <div className="rounded-xl bg-red-400 py-3 text-center text-black">
  //           Survey Error: {errorLoadingResult.message}
  //         </div>
  //       ) : null}
  //     </ScrollArea>
  //   );
  // };

  const dialog = useMemo(
    () => (
      <AdaptiveDialog
        isOpen={isOpenPublicResults}
        trigger={trigger}
        handleOpenChange={isOpenPublicResults ? closePublicResults : openPublicResults}
        title={
          resultDialogType === 'chart' ? t('surveys.actions.showResultsChart') : t('surveys.actions.showResultsTable')
        }
        body={dialogBody /* getDialogBody() */}
        desktopContentClassName="min-h-[75%] max-w-[85%]"
      />
    ),
    [result],
  );

  if (isLoadingResult) return <LoadingIndicator isOpen={isLoadingResult} />;

  return dialog;
};

export default ResultDialog;
