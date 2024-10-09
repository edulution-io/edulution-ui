import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import ChoiceWithBackendLimit from '@/pages/Surveys/Editor/components/ChoiceWithBackendLimit';
import { CHOOSE_OTHER_ITEM_CHOICE_NAME } from '@/pages/Surveys/Editor/components/ChoicesWithBackendLimitsShowOtherItem';
import { Button } from '@/components/shared/Button';

interface ChoicesWithBackendLimitsProps {
  questionId: string;
  choices: ChoiceDto[];
  addChoice: (name: string) => void;
  removeChoice: (name: string) => void;
  updateChoice: (name: string, choice: ChoiceDto) => void;
}

const ChoicesWithBackendLimits = (props: ChoicesWithBackendLimitsProps) => {
  const { questionId, choices, addChoice, removeChoice, updateChoice } = props;

  const { t } = useTranslation();

  const addNewChoice = () => {
    const randomId = uuidv4();
    addChoice(`choice-${choices.length}_id-${randomId}`);
  };

  return (
    <>
      <p className="ml-2 text-sm text-foreground">{t('survey.editor.questionSettings.addBackendLimiters')}</p>
      <div className="ml-2 flex-1 items-center text-foreground">
        {
          choices.map((choice: ChoiceDto, index: number) =>
            choice.name !== CHOOSE_OTHER_ITEM_CHOICE_NAME
            ? (
                <ChoiceWithBackendLimit
                  // eslint-disable-next-line react/no-array-index-key
                  key={`choiceLimit-${questionId}-${choice.name}_id-${index}`}
                  name={choice.name}
                  setName={(name: string) => {
                    updateChoice(choice.name, { ...choice, name });
                  }}
                  title={choice.title}
                  setTitle={(title: string) => {
                    updateChoice(choice.name, { ...choice, title });
                  }}
                  limit={choice.limit}
                  setLimit={(limit: number) => {
                    updateChoice(choice.name, { ...choice, limit });
                  }}
                  removeChoice={removeChoice}
                />
              )
            : null
          )
        }
        <Button
          type="button"
          onClick={addNewChoice}
          variant="btn-outline"
          className="mt-2 flex items-center"
        >
          <span className="text-foreground">{t('survey.editor.questionSettings.addChoice')}</span>
        </Button>
      </div>
    </>
  );
};

export default ChoicesWithBackendLimits;
