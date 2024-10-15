import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import cn from '@/lib/utils';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/useSurveyEditorFormStore';
import useQuestionSettingsDialogStore from '@/pages/Surveys/Editor/dialog/useQuestionSettingsDialogStore';
import ChoicesWithBackendLimits from '@/pages/Surveys/Editor/components/ChoicesWithBackendLimits';
import ChoicesWithBackendLimitsShowOtherItem from '@/pages/Surveys/Editor/components/ChoicesWithBackendLimitsShowOtherItem';
import Switch from '@/components/ui/Switch';

interface ChoicesByUrlProps {
  backendLimiters: { questionName: string; choices: ChoiceDto[] }[];
}

const ChoicesByUrl = (props: ChoicesByUrlProps) => {
  const { backendLimiters } = props;

  const { t } = useTranslation();

  const { publicSurveyId } = useSurveyEditorFormStore();
  const { questionType, useBackendLimits, toggleUseBackendLimits, setBackendLimiters } =
    useQuestionSettingsDialogStore();

  useEffect(() => {
    setBackendLimiters(backendLimiters);
  }, []);

  const hasChoices = questionType === 'radiogroup' || questionType === 'checkbox' || questionType === 'dropdown';
  if (!hasChoices) return null;
  return (
    <>
      <p className="text-m font-bold text-foreground">{t('survey.editor.questionSettings.backendLimiters')}</p>
      <div className="ml-2 inline-flex">
        <Switch
          checked={useBackendLimits}
          onCheckedChange={() => toggleUseBackendLimits(publicSurveyId)}
          className={cn({ 'text-gray-300': !useBackendLimits }, { 'text-foreground': useBackendLimits })}
        />
        <p className="ml-2 text-sm">{`${t('common.enable')}/${t('common.disable')}`}</p>
      </div>
      <ChoicesWithBackendLimits />
      <ChoicesWithBackendLimitsShowOtherItem />
      <p className="b-0 text-sm font-bold text-foreground">{t('survey.editor.questionSettings.nullLimit')}</p>
    </>
  );
};

export default ChoicesByUrl;
