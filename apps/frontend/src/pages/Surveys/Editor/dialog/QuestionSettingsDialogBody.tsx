import React from 'react';
import { useTranslation } from 'react-i18next';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import cn from '@/lib/utils';
import ChoicesByUrl from '@/pages/Surveys/Editor/components/ChoicesByUrl';
import useQuestionSettingsDialogStore from '@/pages/Surveys/Editor/dialog/useQuestionSettingsDialogStore';
import Input from '@/components/shared/Input';

interface QuestionSettingsDialogBodyProps {
  backendLimiters: { questionName: string; choices: ChoiceDto[] }[];
}

const QuestionSettingsDialogBody = (props: QuestionSettingsDialogBodyProps) => {
  const { backendLimiters } = props;
  const { selectedQuestion, questionTitle, setQuestionTitle, questionDescription, setQuestionDescription } =
    useQuestionSettingsDialogStore();

  const { t } = useTranslation();

  if (!selectedQuestion) return null;
  return (
    <>
      <p className="text-m font-bold text-foreground">{t('survey.editor.questionSettings.questionTitle')}</p>
      <div className="ml-2 flex-1 items-center text-foreground">
        <Input
          type="text"
          value={questionTitle}
          onChange={(e) => setQuestionTitle(e.target.value)}
          variant="default"
          className={cn({ 'text-gray-300': !questionTitle }, { 'text-foreground': questionTitle })}
        />
      </div>

      <p className="text-m font-bold text-foreground">{t('survey.editor.questionSettings.questionDescription')}</p>
      <div className="ml-2 flex-1 items-center text-foreground">
        <Input
          type="text"
          placeholder={t('survey.editor.questionSettings.addQuestionDescription')}
          value={questionDescription}
          onChange={(e) => setQuestionDescription(e.target.value)}
          variant="default"
          className={cn({ 'text-gray-300': !questionDescription }, { 'text-foreground': questionDescription })}
        />
      </div>

      <ChoicesByUrl backendLimiters={backendLimiters} />
    </>
  );
};

export default QuestionSettingsDialogBody;
