import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Question } from 'survey-core/typings/question';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import cn from '@/lib/utils';
import Input from '@/components/shared/Input';
import ChoiceWithBackendLimit from '@/pages/Surveys/Editor/components/ChoiceWithBackendLimit';

interface QuestionSettingsDialogBodyProps {
  selectedQuestion: Question;
  backendLimiters: { questionId: string; choices: ChoiceDto[] }[];
  setBackendLimiters: (questionId: string, choices: ChoiceDto[]) => void;
}

const QuestionSettingsDialogBody = (props: QuestionSettingsDialogBodyProps) => {
  const { selectedQuestion, backendLimiters = [], setBackendLimiters } = props;

  const [choices, setChoices] = useState<ChoiceDto[]>([]);

  useEffect(() => {
    const limiters = backendLimiters.find((limiter) => limiter.questionId === selectedQuestion.id);
    if (limiters) {
      setChoices(limiters.choices);
    }
  }, [backendLimiters, selectedQuestion.id]);

  const limiters = useMemo(
    () => backendLimiters.find((limiter) => limiter.questionId === selectedQuestion.id),
    [backendLimiters, selectedQuestion.id],
  );

  const renderedChoices = useMemo(
    () =>
      choices.map((choice, index) => (
        <ChoiceWithBackendLimit
          key={`choiceLimit-${selectedQuestion.id}-${choice.title}`}
          title={choice.title}
          setTitle={(title) => {
            choices[index].title = title;
            setBackendLimiters(selectedQuestion.id, choices);
          }}
          limit={choice.limit}
          setLimit={(limit) => {
            choices[index].limit = limit;
            setBackendLimiters(selectedQuestion.id, choices);
          }}
        />
      )),
    [limiters],
  );

  const { t } = useTranslation();

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
