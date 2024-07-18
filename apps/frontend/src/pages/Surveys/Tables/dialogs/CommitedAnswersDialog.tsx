import React, { useEffect } from 'react';
import mongoose from 'mongoose';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import CommitedAnswersDialogBody from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialogBody';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

interface ShowSurveyAnswerDialogProps {
  surveyId: mongoose.Types.ObjectId;
  surveyJSON: JSON | undefined;
  answerJSON: JSON | undefined;

  isOpenCommitedAnswersDialog: boolean;
  setIsOpenCommitedAnswersDialog: (state: boolean) => void;
  getUsersCommitedAnswer: (surveyId: mongoose.Types.ObjectId, userName?: string) => Promise<void>;
  isLoading: boolean;

  trigger?: React.ReactNode;
}

const CommitedAnswersDialog = (props: ShowSurveyAnswerDialogProps) => {
  const {
    surveyId,
    surveyJSON,
    answerJSON,

    isOpenCommitedAnswersDialog,
    setIsOpenCommitedAnswersDialog,
    getUsersCommitedAnswer,
    isLoading,

    trigger,
  } = props;

  const { t } = useTranslation();

  useEffect((): void => {
    if (isOpenCommitedAnswersDialog) {
      void getUsersCommitedAnswer(surveyId);
    }
  }, [isOpenCommitedAnswersDialog, surveyId]);

  if (isLoading) {
    return <LoadingIndicator isOpen={isLoading} />;
  }

  const getDialogBody = () => (
    // TODO: NIEDUUI-222: Add a user selection to show answers of a selected user when current user is admin
    <ScrollArea>
      <CommitedAnswersDialogBody
        formula={surveyJSON!}
        answer={answerJSON!}
      />
    </ScrollArea>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenCommitedAnswersDialog}
      trigger={trigger}
      handleOpenChange={() => setIsOpenCommitedAnswersDialog(!isOpenCommitedAnswersDialog)}
      title={t('surveys.commitedAnswersDialog.title')}
      body={getDialogBody()}
      desktopContentClassName="max-w-[75%]"
    />
  );
};

export default CommitedAnswersDialog;
