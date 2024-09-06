import React from 'react';
import { useTranslation } from 'react-i18next';
import { Question } from 'survey-core/typings/question';
import QuestionSettingsDialogBody from '@/pages/Surveys/Editor/dialog/QuestionSettingsDialogBody';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

interface QuestionSettingsDialogProps {
  selectedQuestion: Question | undefined;
  isOpenQuestionSettingsDialog: boolean;
  setIsOpenQuestionSettingsDialog: (state: boolean) => void;
}

const QuestionSettingsDialog = (props: QuestionSettingsDialogProps) => {
  const { selectedQuestion, isOpenQuestionSettingsDialog, setIsOpenQuestionSettingsDialog } = props;

  const { t } = useTranslation();

  if (!selectedQuestion) return null;
  return (
    <AdaptiveDialog
      isOpen={isOpenQuestionSettingsDialog}
      handleOpenChange={() => setIsOpenQuestionSettingsDialog(!isOpenQuestionSettingsDialog)}
      title={t('surveys.saveDialog.title')}
      body={<QuestionSettingsDialogBody selectedQuestion={selectedQuestion} />}
      desktopContentClassName="max-w-[50%] max-h-[90%] overflow-auto"
    />
  );
};

export default QuestionSettingsDialog;
