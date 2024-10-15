import React from 'react';
import { useTranslation } from 'react-i18next';
import cn from '@/lib/utils';
import useQuestionSettingsDialogStore from '@/pages/Surveys/Editor/dialog/useQuestionSettingsDialogStore';
import Switch from '@/components/ui/Switch';
import Input from '@/components/shared/Input';
import Label from '@/components/ui/Label';
import CHOOSE_OTHER_ITEM_CHOICE_NAME from '@libs/survey/constants/CHOOSE_OTHER_ITEM_CHOICE_NAME';

const ChoicesWithBackendLimitsShowOtherItem = () => {
  const { useBackendLimits, showOtherItem, toggleShowOtherItem, setChoiceLimit, choices, addChoice } =
    useQuestionSettingsDialogStore();

  const { t } = useTranslation();

  const otherItemsChoiceWithBackendLimit = choices.find((choice) => choice.name === CHOOSE_OTHER_ITEM_CHOICE_NAME);

  if (!useBackendLimits) return null;
  return (
    <div className="ml-2 flex-1 items-center text-foreground">
      <div className="ml-2 inline-flex">
        <Switch
          checked={showOtherItem}
          onCheckedChange={toggleShowOtherItem}
          className={cn({ 'text-gray-300': !useBackendLimits }, { 'text-foreground': useBackendLimits })}
        />
        <p className="ml-2 text-sm font-bold text-foreground">{t('survey.editor.questionSettings.useOtherItem')}</p>
      </div>
      {showOtherItem ? (
        <>
          <p className="ml-4 mt-2 text-sm text-foreground">
            {t('survey.editor.questionSettings.addBackendLimiterForOtherItem')}
          </p>
          <div className="ml-4 inline-flex items-center">
            <Label className="text-m flex-0 font-bold text-foreground">
              {t('survey.editor.questionSettings.limit')}:
            </Label>
            <Input
              type="number"
              placeholder={t('common.limit')}
              value={otherItemsChoiceWithBackendLimit?.limit || 0}
              onChange={(e) =>
                otherItemsChoiceWithBackendLimit
                  ? setChoiceLimit(CHOOSE_OTHER_ITEM_CHOICE_NAME, Number(e.target.value))
                  : addChoice(CHOOSE_OTHER_ITEM_CHOICE_NAME, '', Number(e.target.value))
              }
              className="ml-2 flex-1 text-foreground"
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ChoicesWithBackendLimitsShowOtherItem;
