import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import { Survey } from '@/pages/Surveys/types/survey';
import ResultTableDialogBody from '@/pages/Surveys/Tables/dialogs/ResultTableDialogBody';

interface ShowSurveyResultsTableDialogProps {
  survey: Survey;

  isOpenPublicResultsTableDialog: boolean;
  openPublicResultsTableDialog: () => void;
  closePublicResultsTableDialog: () => void;
  getSurveyResult: (surveyId: number, participants: Attendee[]) => Promise<JSON[] | undefined>;
  result: JSON[];
  isLoadingResult: boolean;
  errorLoadingResult: Error | null;

  trigger?: React.ReactNode;
}

const ResultTableDialog = (props: ShowSurveyResultsTableDialogProps) => {
  const {
    survey,

    isOpenPublicResultsTableDialog,
    openPublicResultsTableDialog,
    closePublicResultsTableDialog,
    getSurveyResult,
    result,
    isLoadingResult,
    errorLoadingResult,

    trigger
  } = props;

  const { t } = useTranslation();

  console.log('ResultTableDialog -> result: ', JSON.stringify(result, null, 2));

  useEffect(() => {
    const fetchAnswers = async () => {
      await getSurveyResult(survey?.id, survey?.participants);
    }

    if (!survey) return;
    if (!isOpenPublicResultsTableDialog) return;

    fetchAnswers();

  }, [survey, isOpenPublicResultsTableDialog]);

  const getDialogBody = () => {
    if (isLoadingResult) return <LoadingIndicator isOpen={isLoadingResult}/>;

    if (!survey?.formula) {
      return (
        <div className="rounded-xl bg-red-400 py-3 text-center text-black">
          <div>{t('survey.noFormula')}</div>
        </div>
      );
    }
    if (!result || result.length == 0) {
      return (
        <div className="rounded-xl bg-red-400 py-3 text-center text-black">
          <div>{t('survey.noAnswer')}</div>
        </div>
      );
    }

    return (
      <ScrollArea className="overflow-y-auto overflow-x-auto">
        <ResultTableDialogBody
          formula={survey.formula}
          result={result}
        />
        {errorLoadingResult ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {'Survey Error'}: {errorLoadingResult.message}
          </div>
        ) : null}
      </ScrollArea>
    );
  };

  return (
    <AdaptiveDialog
      isOpen={isOpenPublicResultsTableDialog}
      trigger={trigger}
      handleOpenChange={isOpenPublicResultsTableDialog ? closePublicResultsTableDialog : openPublicResultsTableDialog}
      title={t('survey.resultingVisualization')}
      body={getDialogBody()}
      desktopContentClassName="max-h-[75vh] max-w-[85%]"
    />
  );
};

export default ResultTableDialog;
