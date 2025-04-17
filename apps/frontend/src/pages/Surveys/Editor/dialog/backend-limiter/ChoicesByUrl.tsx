/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import cn from '@libs/common/utils/className';
import CHOOSE_OTHER_ITEM_CHOICE_NAME from '@libs/survey/constants/choose-other-item-choice-name';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import ChoicesWithBackendLimitsShowOtherItem from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesWithBackendLimitsShowOtherItem';
import ChoicesWithBackendLimitTable from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesWithBackendLimitsTable';
import ChoicesWithBackendLimitTableColumns from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesWithBackendLimitTableColumns';
import Switch from '@/components/ui/Switch';

interface ChoicesByUrlProps {
  backendLimiters?: { questionId: string; choices: ChoiceDto[] }[];
  updateBackendLimiters: (backendLimiters: { questionId: string; choices: ChoiceDto[] }[]) => void;
}

const ChoicesByUrl = (props: ChoicesByUrlProps) => {
  const { backendLimiters, updateBackendLimiters } = props;

  const { t } = useTranslation();

  const { publicSurveyId } = useSurveyEditorPageStore();
  const {
    questionType,
    useBackendLimits,
    toggleUseBackendLimits,
    setBackendLimiters,
    currentChoices,
    addNewChoice,
    currentBackendLimiters,
  } = useQuestionsContextMenuStore();

  useEffect(() => {
    if (!backendLimiters) return;
    setBackendLimiters(backendLimiters);
  }, [backendLimiters]);

  useEffect(() => {
    updateBackendLimiters(currentBackendLimiters);
  }, [currentChoices]);

  const hasChoices = questionType === 'radiogroup' || questionType === 'checkbox' || questionType === 'dropdown';
  if (!hasChoices) return null;
  return (
    <>
      <p className="text-m font-bold text-primary-foreground">{t('survey.editor.questionSettings.backendLimiters')}</p>
      {useBackendLimits ? (
        <p className="b-0 text-sm font-bold text-muted-foreground">{t('survey.editor.questionSettings.nullLimit')}</p>
      ) : (
        <p className="ml-4 text-sm text-muted-foreground">{t('survey.editor.questionSettings.addBackendLimiters')}</p>
      )}
      <div className="ml-2 inline-flex">
        <Switch
          checked={useBackendLimits}
          onCheckedChange={() => toggleUseBackendLimits(publicSurveyId)}
          className={cn(
            { 'text-muted-foreground': !useBackendLimits },
            { 'text-primary-foreground': useBackendLimits },
          )}
        />
        <p className="ml-2 text-sm">{t(`common.${useBackendLimits ? 'disable' : 'enable'}`)}</p>
      </div>
      {useBackendLimits ? (
        <>
          <div className="ml-4 items-center text-foreground">
            <ChoicesWithBackendLimitTable
              columns={ChoicesWithBackendLimitTableColumns}
              data={currentChoices.filter((choice) => choice.name !== CHOOSE_OTHER_ITEM_CHOICE_NAME)}
              addNewChoice={addNewChoice}
            />
          </div>
          <ChoicesWithBackendLimitsShowOtherItem />
        </>
      ) : null}
    </>
  );
};

export default ChoicesByUrl;
