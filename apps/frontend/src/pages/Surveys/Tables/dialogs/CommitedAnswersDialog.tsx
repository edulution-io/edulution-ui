import React, { useCallback, useEffect } from 'react';
import mongoose from 'mongoose';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import Survey from '@libs/survey/types/survey';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import CommitedAnswersDialogBody from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialogBody';

interface ShowSurveyAnswerDialogProps {
  survey?: Survey;

  isOpenCommitedAnswersDialog: boolean;
  openCommitedAnswersDialog: () => void;
  closeCommitedAnswersDialog: () => void;
  getUsersCommitedAnswer: (surveyId: mongoose.Types.ObjectId, userName?: string) => Promise<JSON | undefined>;
  // user: string | undefined;
  // selectUser: (user: string) => void;
  answer: JSON | undefined;
  isLoading: boolean;
  error: Error | null;

  trigger?: React.ReactNode;
}

const CommitedAnswersDialog = (props: ShowSurveyAnswerDialogProps) => {
  const {
    survey,

    isOpenCommitedAnswersDialog,
    openCommitedAnswersDialog,
    closeCommitedAnswersDialog,
    getUsersCommitedAnswer,
    // user,
    // selectUser,
    answer,
    isLoading,
    error,

    trigger,
  } = props;

  if (!isOpenCommitedAnswersDialog) return null;

  const { t } = useTranslation();

  const getAnswer = useCallback(() => {
    if (!survey) return;
    // eslint-disable-next-line  no-underscore-dangle
    void getUsersCommitedAnswer(survey._id);
  }, []);

  useEffect((): void => {
    getAnswer();
  }, []);

  if (!survey) return null;
  if (!answer) return null;

  const getDialogBody = () => {
    // TODO: NIEDUUI-222: Add a user selection to show answers of a selected user when current user is admin
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
    return (
      <ScrollArea>
        <CommitedAnswersDialogBody
          formula={survey.formula}
          answer={answer}
        />
        {error ? toast.error(t(error.message)) : null}
      </ScrollArea>
    );
  };
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
