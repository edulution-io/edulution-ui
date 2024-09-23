import React from 'react';
import { useTranslation } from 'react-i18next';
import useQuestionSettingsDialogStore from '@/pages/Surveys/Editor/dialog/useQuestionSettingsDialogStore';
import ChoicesWithBackendLimitTable from '@/pages/Surveys/Editor/components/table/ChoicesWithBackendLimitTable';
import ChoicesWithBackendLimitTableColumns from '@/pages/Surveys/Editor/components/table/ChoicesWithBackendLimitTableColumns';

const ChoicesByUrl = () => {
  const { selectedQuestion, choices, addNewChoice } = useQuestionSettingsDialogStore();

  const { t } = useTranslation();

  if (!selectedQuestion) {
    return null;
  }

  const type = selectedQuestion.getType();
  if (type !== 'dropdown' && type !== 'radiogroup' && type !== 'checkbox') {
    return null;
  }

  return (
    <>
      <p className="text-m font-bold text-foreground">{t('survey.editor.questionSettings.backendLimiters')}</p>
      <p className="ml-2 font-bold text-foreground">{t('survey.editor.questionSettings.addBackendLimiters')}</p>
      <p className="ml-2 text-sm text-foreground">{t('survey.editor.questionSettings.addUpperBackendLimiters')}</p>
      <ChoicesWithBackendLimitTable
        columns={ChoicesWithBackendLimitTableColumns}
        data={choices || []}
        addNewChoice={addNewChoice}
      />
    </>
  );
};

export default ChoicesByUrl;
