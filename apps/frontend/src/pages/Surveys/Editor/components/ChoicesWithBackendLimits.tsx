import React from 'react';
import { useTranslation } from 'react-i18next';
import useQuestionSettingsDialogStore from '@/pages/Surveys/Editor/dialog/useQuestionSettingsDialogStore';
import ChoicesWithBackendLimitTable from '@/pages/Surveys/Editor/components/table/ChoicesWithBackendLimitTable';
import ChoicesWithBackendLimitTableColumns from '@/pages/Surveys/Editor/components/table/ChoicesWithBackendLimitTableColumns';
import CHOOSE_OTHER_ITEM_CHOICE_NAME from '@libs/survey/constants/CHOOSE_OTHER_ITEM_CHOICE_NAME';

const ChoicesWithBackendLimits = () => {
  const { useBackendLimits, choices, addNewChoice } = useQuestionSettingsDialogStore();

  const { t } = useTranslation();
  if (!useBackendLimits) return null;
  return (
    <div>
      <p className="ml-4 text-sm text-foreground">{t('survey.editor.questionSettings.addBackendLimiters')}</p>
      <div className="ml-4 items-center text-foreground">
        <ChoicesWithBackendLimitTable
          columns={ChoicesWithBackendLimitTableColumns}
          data={choices.filter((choice) => choice.name !== CHOOSE_OTHER_ITEM_CHOICE_NAME)}
          addNewChoice={addNewChoice}
        />
      </div>
    </div>
  );
};

export default ChoicesWithBackendLimits;
