import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import QuestionSettingsDialogBody from '@/pages/Surveys/Editor/dialog/QuestionSettingsDialogBody';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

interface QuestionSettingsDialogProps {
  backendLimitersWatcher: { questionName: string; choices: ChoiceDto[] }[];
  isOpenQuestionSettingsDialog: boolean;
  setIsOpenQuestionSettingsDialog: (state: boolean) => void;
  setBackendLimiters: (state: { questionName: string; choices: ChoiceDto[] }[]) => void;
}

const QuestionSettingsDialog = (props: QuestionSettingsDialogProps) => {
  const { backendLimitersWatcher, isOpenQuestionSettingsDialog, setIsOpenQuestionSettingsDialog, setBackendLimiters } =
    props;

  useEffect(() => {
    setBackendLimiters(backendLimitersWatcher);
  }, []);

  const { t } = useTranslation();
  return (
    <AdaptiveDialog
      isOpen={isOpenQuestionSettingsDialog}
      handleOpenChange={() => setIsOpenQuestionSettingsDialog(!isOpenQuestionSettingsDialog)}
      title={t('survey.editor.questionSettings.title')}
      body={<QuestionSettingsDialogBody />}
      desktopContentClassName="max-w-[50%] max-h-[90%] overflow-auto"
    />
  );
};

export default QuestionSettingsDialog;
