import React, { useEffect } from 'react';
import mongoose from 'mongoose';
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
  setIsOpenPublicResultsTableDialog: (state: boolean) => void;
  getSurveyResult: (surveyId: mongoose.Types.ObjectId, participants: AttendeeDto[]) => Promise<void>;
  result: JSON[] | undefined;
  isLoading: boolean;

  trigger?: React.ReactNode;
}

const ResultTableDialog = (props: ShowSurveyResultsTableDialogProps) => {
  const {
    survey,

    isOpenPublicResultsTableDialog,
    setIsOpenPublicResultsTableDialog,
    getSurveyResult,
    result,
    isLoading,
    trigger,
  } = props;

  const { t } = useTranslation();

  useEffect((): void => {
    if (survey && isOpenPublicResultsTableDialog) {
      void getSurveyResult(survey.id, survey.invitedAttendees);
    }
  }, [isOpenPublicResultsTableDialog, survey]);

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
      <ScrollArea className="overflow-x-auto overflow-y-auto">
        <ResultTableDialogBody
          formula={survey.formula}
          result={result}
        />
      </ScrollArea>
    );
  };

  return isOpenPublicResultsTableDialog ? (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      <AdaptiveDialog
        isOpen={isOpenPublicResultsTableDialog}
        trigger={trigger}
        handleOpenChange={() => setIsOpenPublicResultsTableDialog(!isOpenPublicResultsTableDialog)}
        title={t('surveys.resultTableDialog.title')}
        body={getDialogBody()}
        desktopContentClassName="max-h-[75vh] max-w-[85%]"
      />
    </>
  ) : null;
};

export default ResultTableDialog;
