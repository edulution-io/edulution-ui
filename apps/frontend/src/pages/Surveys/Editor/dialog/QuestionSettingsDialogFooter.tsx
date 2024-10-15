import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { PUBLIC_SURVEYS_ENDPOINT, RESTFUL_CHOICES_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/useSurveyEditorFormStore';
import useQuestionSettingsDialogStore from '@/pages/Surveys/Editor/dialog/useQuestionSettingsDialogStore';
import { Button } from '@/components/shared/Button';

interface QuestionSettingsDialogFooterProps {
  form: UseFormReturn<SurveyDto>;
}

const QuestionSettingsDialogFooter = (props: QuestionSettingsDialogFooterProps) => {
  const { form } = props;
  const { publicSurveyId } = useSurveyEditorFormStore();
  const {
    setIsOpenQuestionSettingsDialog,
    setSelectedQuestion,
    selectedQuestion,
    updateLimitersChoices,
    questionTitle,
    questionDescription,
    useBackendLimits,
    choices,
    showOtherItem,
  } = useQuestionSettingsDialogStore();

  const { t } = useTranslation();

  const handleSaveQuestionSettings = () => {
    if (!selectedQuestion) return;

    selectedQuestion.title = questionTitle;
    selectedQuestion.description = questionDescription;
    selectedQuestion.choices = useBackendLimits ? null : choices;
    selectedQuestion.showOtherItem = useBackendLimits && showOtherItem ? true : selectedQuestion.showOtherItem;
    selectedQuestion.choicesByUrl = useBackendLimits
      ? {
          url: `${window.location.origin}/${PUBLIC_SURVEYS_ENDPOINT}/${RESTFUL_CHOICES_ENDPOINT}/${publicSurveyId || '<<SURVEY-ID>>'}/${selectedQuestion.name || '<<QUESTION-NAME>>'}`,
          valueName: 'value',
          titleName: 'title',
          toJSON() {
            // eslint-disable-next-line react/no-this-in-sfc, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
            return this.url;
          },
        }
      : null;

    const limiters = updateLimitersChoices(choices);
    form.setValue('backendLimiters', limiters);

    setSelectedQuestion(undefined);
    setIsOpenQuestionSettingsDialog(false);
  };

  return (
    <div className="mt-4 flex justify-end">
      <Button
        type="submit"
        variant="btn-collaboration"
        size="lg"
        onClick={handleSaveQuestionSettings}
      >
        {t('common.save')}
      </Button>
    </div>
  );
};

export default QuestionSettingsDialogFooter;
