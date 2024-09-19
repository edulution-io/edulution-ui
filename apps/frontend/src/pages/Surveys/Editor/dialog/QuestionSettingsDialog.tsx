import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Question } from 'survey-core/typings/question';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import QuestionSettingsDialogBody from '@/pages/Surveys/Editor/dialog/QuestionSettingsDialogBody';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

interface QuestionSettingsDialogProps {
  form: UseFormReturn<SurveyDto>;
  backendLimiters: { questionId: string; choices: ChoiceDto[] }[];
  selectedQuestion: Question;
  isOpenQuestionSettingsDialog: boolean;
  setIsOpenQuestionSettingsDialog: (state: boolean) => void;
}

const QuestionSettingsDialog = (props: QuestionSettingsDialogProps) => {
  const { form, backendLimiters, selectedQuestion, isOpenQuestionSettingsDialog, setIsOpenQuestionSettingsDialog } =
    props;

  const { t } = useTranslation();

  const limiterIndex = backendLimiters?.findIndex((limiter) => limiter.questionId === selectedQuestion?.id);
  const choices = backendLimiters[limiterIndex]?.choices || [];

  const updateBackendLimiters = (limitedChoices: ChoiceDto[]): void => {
    const limits: { questionId: string; choices: ChoiceDto[] }[] = JSON.parse(JSON.stringify(backendLimiters)) as {
      questionId: string;
      choices: ChoiceDto[];
    }[];
    if (limiterIndex === -1) {
      limits.push({ questionId: selectedQuestion.id, choices: limitedChoices });
    } else {
      limits[limiterIndex].choices = limitedChoices;
    }
    form.setValue('backendLimiters', limits);
  };

  if (!selectedQuestion) return null;
  return (
    <AdaptiveDialog
      isOpen={isOpenQuestionSettingsDialog}
      handleOpenChange={() => setIsOpenQuestionSettingsDialog(!isOpenQuestionSettingsDialog)}
      title={t('surveys.saveDialog.title')}
      body={
        <QuestionSettingsDialogBody
          choices={choices}
          updateChoices={updateBackendLimiters}
          selectedQuestion={selectedQuestion}
        />
      }
      desktopContentClassName="max-w-[50%] max-h-[90%] overflow-auto"
    />
  );
};

export default QuestionSettingsDialog;
