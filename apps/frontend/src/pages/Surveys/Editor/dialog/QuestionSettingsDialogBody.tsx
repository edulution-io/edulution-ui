import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import cn from '@/lib/utils';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import useQuestionSettingsDialogStore from '@/pages/Surveys/Editor/dialog/useQuestionSettingsDialogStore';
import ChoicesWithBackendLimitTable from '@/pages/Surveys/Editor/components/table/ChoicesWithBackendLimitTable';
import ChoicesWithBackendLimitTableColumns from '@/pages/Surveys/Editor/components/table/ChoicesWithBackendLimitTableColumns';

const QuestionSettingsDialogBody = () => {
  const { t } = useTranslation();

  const { selectedQuestion, choices, addNewChoice } = useQuestionSettingsDialogStore();

  const choicesTable = useMemo(
    () => (
      <ChoicesWithBackendLimitTable
        columns={ChoicesWithBackendLimitTableColumns}
        data={choices || []}
      />
    ),
    [choices],
  );

  if (!selectedQuestion) return null;
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
      {choicesTable}
      <Button
        type="button"
        onClick={() => addNewChoice()}
        variant="btn-outline"
        className="flex items-center"
      >
        <span className="text-foreground">{t('survey.editor.questionSettings.addChoice')}</span>
      </Button>
    </>
  );
};

export default QuestionSettingsDialogBody;
