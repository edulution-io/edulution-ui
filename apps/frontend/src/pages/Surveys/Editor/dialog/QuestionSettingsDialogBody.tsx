import React from 'react';
import { Question } from 'survey-core/typings/question';
import { useTranslation } from 'react-i18next';
import cn from '@/lib/utils';
import Input from '@/components/shared/Input';

interface QuestionSettingsDialogBodyProps {
  selectedQuestion: Question;
}

const QuestionSettingsDialogBody = (props: QuestionSettingsDialogBodyProps) => {
  const { selectedQuestion } = props;

  const { t } = useTranslation();

  return (
    <>
      <p className="text-m font-bold text-foreground">{t('survey.editor.title')}</p>
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

      <p className="text-m font-bold text-foreground">{t('survey.editor.description')}</p>
      <div className="ml-2 flex-1 items-center text-foreground">
        <Input
          type="text"
          placeholder={t('survey.editor.addDescription')}
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
    </>
  );
};

export default QuestionSettingsDialogBody;
