import mongoose from 'mongoose';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Survey from '@libs/survey/types/survey';
import Attendee from '@libs/survey/types/attendee';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ResultTableDialogBody from '@/pages/Surveys/Tables/dialogs/ResultTableDialogBody';

interface ShowSurveyResultsTableDialogProps {
  survey: Survey;

  isOpenPublicResultsTableDialog: boolean;
  openPublicResultsTableDialog: () => void;
  closePublicResultsTableDialog: () => void;
  getSurveyResult: (surveyId: mongoose.Types.ObjectId, participants: Attendee[]) => Promise<JSON[] | undefined>;
  result: JSON[];
  isLoading: boolean;

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
  } = props;

  if (!isOpenPublicResultsTableDialog) return null;

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
