import React, { useCallback, useEffect } from 'react';
import mongoose from 'mongoose';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import SurveyDto from '@libs/survey/types/survey.dto';
import AttendeeDto from '@libs/conferences/types/attendee.dto';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ResultTableDialogBody from '@/pages/Surveys/Tables/dialogs/ResultTableDialogBody';

interface ShowSurveyResultsTableDialogProps {
  survey: SurveyDto;

  isOpenPublicResultsTableDialog: boolean;
  openPublicResultsTableDialog: () => void;
  closePublicResultsTableDialog: () => void;
  getSurveyResult: (surveyId: mongoose.Types.ObjectId, participants: AttendeeDto[]) => Promise<JSON[] | undefined>;
  result: JSON[];
  isLoading: boolean;
  error: Error | null;

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
    isLoading,
    trigger,
    error,
  } = props;

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
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;

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
        <ResultTableDialogBody
          formula={survey.formula}
          result={result}
        />
        {error ? toast.error(t(error.message)) : null}
      </ScrollArea>
    );
  };

  if (!isOpenPublicResultsTableDialog) return null;

  return (
    <AdaptiveDialog
      isOpen={isOpenPublicResultsTableDialog}
      trigger={trigger}
      handleOpenChange={isOpenPublicResultsTableDialog ? closePublicResultsTableDialog : openPublicResultsTableDialog}
      title={t('surveys.resultTableDialog.title')}
      body={getDialogBody()}
      desktopContentClassName="max-h-[75vh] max-w-[85%]"
    />
  );
};

export default ResultTableDialog;
