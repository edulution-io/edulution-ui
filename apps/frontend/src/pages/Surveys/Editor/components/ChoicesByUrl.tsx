import React from 'react';
import { useTranslation } from 'react-i18next';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import cn from '@/lib/utils';
import ChoicesWithBackendLimits
  from '@/pages/Surveys/Editor/components/ChoicesWithBackendLimits';
import Switch from '@/components/ui/Switch';
import ChoicesWithBackendLimitsShowOtherItem
  from '@/pages/Surveys/Editor/components/ChoicesWithBackendLimitsShowOtherItem';
import useQuestionSettingsDialogStore from '@/pages/Surveys/Editor/dialog/useQuestionSettingsDialogStore';

const ChoicesByUrl = () => {
  const {
    selectedQuestion,
    choices,
    updateLimitersChoices: updateChoices,
  } = useQuestionSettingsDialogStore();

  const { t } = useTranslation();

  const addChoice = (name: string, title: string = '', limit: number = 0 ) => {
    const newChoice = { name, title, limit };
    const updatedChoices: ChoiceDto[] = [ ...choices, newChoice ];
    updateChoices(updatedChoices);
  };

  const removeChoice = (name: string) => {
    const updatedChoices = choices.filter((choice: ChoiceDto) => choice.name !== name);
    updateChoices(updatedChoices);
  };

  const updateChoice = (name: string, updatedChoice: ChoiceDto) => {
    const updatedChoices = choices.map((c: ChoiceDto) => (c.name === name ? updatedChoice : c));
    updateChoices(updatedChoices);
  };

  if (!selectedQuestion) return null;

  const questionType = selectedQuestion.getType();
  const hasChoices = questionType === 'radiogroup' || questionType === 'checkbox' || questionType === 'dropdown';
  if (!hasChoices) return null;

  const useBackendLimits = !!selectedQuestion?.choicesByUrl;
  const setUseBackendLimits = (state: boolean) => {
    if (!state) {
      selectedQuestion.choicesByUrl = null;
    } else {
      selectedQuestion.choicesByUrl = { url: '' }
    }
  }

  return (
    <>
      <p className="text-m font-bold text-foreground">{t('survey.editor.questionSettings.backendLimiters')}</p>
      <Switch
        defaultChecked={useBackendLimits}
        onChange={() => setUseBackendLimits(!useBackendLimits)}
        className={cn(
          {'text-gray-300': !selectedQuestion.choicesByUrl},
          {'text-foreground': !!selectedQuestion.choicesByUrl},
        )}
      />
      { useBackendLimits
        ? (
            <>
              <ChoicesWithBackendLimits
                questionId={selectedQuestion.id}
                choices={choices}
                addChoice={addChoice}
                removeChoice={removeChoice}
                updateChoice={updateChoice}
              />

              <ChoicesWithBackendLimitsShowOtherItem
                selectedQuestion={selectedQuestion}
                choices={choices}
                addChoice={addChoice}
                removeChoice={removeChoice}
                updateChoice={updateChoice}
              />
            </>
          )
        : null
      }
    </>
  );
};

export default ChoicesByUrl;
