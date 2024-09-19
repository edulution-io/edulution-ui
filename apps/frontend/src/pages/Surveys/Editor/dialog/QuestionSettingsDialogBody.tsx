import React, { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { Question } from 'survey-core/typings/question';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import cn from '@/lib/utils';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import ChoiceWithBackendLimit from '@/pages/Surveys/Editor/components/ChoiceWithBackendLimit';

interface QuestionSettingsDialogBodyProps {
  selectedQuestion: Question;
  choices: ChoiceDto[];
  updateChoices: (updatedChoices: ChoiceDto[]) => void;
}

const QuestionSettingsDialogBody = (props: QuestionSettingsDialogBodyProps) => {
  const { selectedQuestion, choices, updateChoices } = props;

  const choicesCopy = JSON.parse(JSON.stringify(choices)) as ChoiceDto[];

  const { t } = useTranslation();

  const addNewChoice = () => {
    const randomId = uuidv4();
    const newChoice = { name: `choice-${choicesCopy.length}_id-${randomId}`, title: '', limit: 0 };
    choicesCopy.push(newChoice);
    updateChoices(choicesCopy);
  };

  const removeChoice = (choicesName: string) => {
    const updatedChoices = choicesCopy.filter((choice: ChoiceDto) => choice.name !== choicesName);
    updateChoices(updatedChoices);
  };

  const renderedChoices = useMemo(
    () => (
      <>
        {choicesCopy.map((choice: ChoiceDto, index: number) => (
          <ChoiceWithBackendLimit
            // eslint-disable-next-line react/no-array-index-key
            key={`choiceLimit-${selectedQuestion.id}-${choice.name}_id-${index}`}
            name={choice.name}
            setName={(name) => {
              choicesCopy[index].name = name;
              updateChoices(choicesCopy);
            }}
            title={choice.title}
            setTitle={(title) => {
              choicesCopy[index].title = title;
              updateChoices(choicesCopy);
            }}
            limit={choice.limit}
            setLimit={(limit) => {
              choicesCopy[index].limit = limit;
              updateChoices(choicesCopy);
            }}
            removeChoice={removeChoice}
          />
        ))}
        <Button
          type="button"
          onClick={addNewChoice}
          variant="btn-outline"
          className="mt-2 flex items-center"
        >
          <span className="text-foreground">{t('survey.editor.questionSettings.addChoice')}</span>
        </Button>
      </>
    ),
    [choices],
  );

  return (
    <>
      <p className="text-m font-bold text-foreground">{t('survey.editor.questionSettings.questionTitle')}</p>
      <div className="ml-2 flex-1 items-center text-foreground">
        <Input
          type="text"
          value={selectedQuestion.title}
          onChange={(e) => {
            selectedQuestion.title = e.target.value;
          }}
          variant="default"
          className={cn({ 'text-gray-300': !selectedQuestion.title }, { 'text-foreground': selectedQuestion.title })}
        />
      </div>

      <p className="text-m font-bold text-foreground">{t('survey.editor.questionSettings.questionDescription')}</p>
      <div className="ml-2 flex-1 items-center text-foreground">
        <Input
          type="text"
          placeholder={t('survey.editor.questionSettings.addQuestionDescription')}
          value={selectedQuestion.description}
          onChange={(e) => {
            selectedQuestion.description = e.target.value;
          }}
          variant="default"
          className={cn(
            { 'text-gray-300': !selectedQuestion.description },
            { 'text-foreground': selectedQuestion.description },
          )}
        />
      </div>

      <p className="text-m font-bold text-foreground">{t('survey.editor.questionSettings.backendLimiters')}</p>
      <p className="ml-2 text-sm text-foreground">{t('survey.editor.questionSettings.addBackendLimiters')}</p>
      <div className="ml-2 flex-1 items-center text-foreground">{renderedChoices}</div>
    </>
  );
};

export default QuestionSettingsDialogBody;
