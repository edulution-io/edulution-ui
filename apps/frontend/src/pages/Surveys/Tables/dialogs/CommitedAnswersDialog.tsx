import React, { useCallback, useEffect } from 'react';
import mongoose from 'mongoose';
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
  isLoadingAnswer: boolean;
  errorLoadingAnswer: Error | null;

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
    isLoadingAnswer,
    errorLoadingAnswer,

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
    if (isLoadingAnswer) return <LoadingIndicator isOpen={isLoadingAnswer} />;
    return (
      <ScrollArea>
        <CommitedAnswersDialogBody
          formula={survey.formula}
          answer={answer}
        />
        {errorLoadingAnswer ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            Survey Error: {errorLoadingAnswer.message}
          </div>
        ) : null}
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