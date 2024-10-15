import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import useQuestionSettingsDialogStore from '@/pages/Surveys/Editor/dialog/useQuestionSettingsDialogStore';
import QuestionSettingsDialogBody from '@/pages/Surveys/Editor/dialog/QuestionSettingsDialogBody';
import QuestionSettingsDialogFooter from '@/pages/Surveys/Editor/dialog/QuestionSettingsDialogFooter';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

interface QuestionSettingsDialogProps {
  form: UseFormReturn<SurveyDto>;
  backendLimitersWatcher: { questionName: string; choices: ChoiceDto[] }[];
}

const QuestionSettingsDialog = (props: QuestionSettingsDialogProps) => {
  const { form, backendLimitersWatcher } = props;
  const { isOpenQuestionSettingsDialog, setIsOpenQuestionSettingsDialog, selectedQuestion } =
    useQuestionSettingsDialogStore();

  const { t } = useTranslation();

  if (!selectedQuestion) return null;
  return (
    <AdaptiveDialog
      isOpen={isOpenQuestionSettingsDialog}
      handleOpenChange={() => setIsOpenQuestionSettingsDialog(!isOpenQuestionSettingsDialog)}
      title={t('survey.editor.questionSettings.title')}
      body={<QuestionSettingsDialogBody backendLimiters={backendLimitersWatcher} />}
      footer={<QuestionSettingsDialogFooter form={form} />}
      desktopContentClassName="max-w-[50%] max-h-[90%] overflow-auto"
    />
  );
};

export default QuestionSettingsDialog;
