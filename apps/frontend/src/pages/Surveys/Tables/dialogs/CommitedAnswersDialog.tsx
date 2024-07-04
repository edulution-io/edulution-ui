import React, { useEffect } from 'react';
import mongoose from 'mongoose';
import { toast } from 'sonner';
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
  openCommitedAnswersDialog: () => void;
  closeCommitedAnswersDialog: () => void;
  getUsersCommitedAnswer: (surveyId: mongoose.Types.ObjectId, userName?: string) => Promise<JSON | undefined>;
  // user: string | undefined;
  // selectUser: (user: string) => void;
  // selectUser: (user: string) => void;
  isLoading: boolean;
  error: Error | null;

  trigger?: React.ReactNode;
}

const CommitedAnswersDialog = (props: ShowSurveyAnswerDialogProps) => {
  const {
    surveyId,
    surveyJSON,
    answerJSON,

    isOpenCommitedAnswersDialog,
    openCommitedAnswersDialog,
    closeCommitedAnswersDialog,
    getUsersCommitedAnswer,
    // user,
    // selectUser,
    isLoading,
    error,

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
      {error ? toast.error(t(error.message)) : null}
    </ScrollArea>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenCommitedAnswersDialog}
      trigger={trigger}
      handleOpenChange={isOpenCommitedAnswersDialog ? closeCommitedAnswersDialog : openCommitedAnswersDialog}
      title={t('survey.answer')}
      body={getDialogBody()}
      desktopContentClassName="max-w-[75%]"
    />
  );
};

export default CommitedAnswersDialog;
