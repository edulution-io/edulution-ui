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
import { UseFormReturn } from 'react-hook-form';
import { SurveyCreatorModel } from 'survey-creator-core';
import cn from '@libs/common/utils/className';
import { SURVEY_RESTFUL_CHOICES } from '@libs/survey/constants/surveys-endpoint';
import CHOOSE_OTHER_ITEM_CHOICE_NAME from '@libs/survey/constants/choose-other-item-choice-name';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyFormula from '@libs/survey/types/TSurveyFormula';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import ChoicesWithBackendLimitsShowOtherItem from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesWithBackendLimitsShowOtherItem';
import ChoicesWithBackendLimitTable from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesWithBackendLimitsTable';
import ChoicesWithBackendLimitTableColumns from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesWithBackendLimitTableColumns';
import Switch from '@/components/ui/Switch';

interface ChoicesByUrlProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreatorModel;
}

const ChoicesByUrl = (props: ChoicesByUrlProps) => {
  const { form, creator } = props;

  const { t } = useTranslation();

  const {
    selectedQuestion,
    questionType,
    useBackendLimits,
    toggleUseBackendLimits,
    setBackendLimiters,
    currentChoices,
    addNewChoice,
    updateLimitersChoices,
    currentBackendLimiters,
    formerChoices,
  } = useQuestionsContextMenuStore();

  useEffect(() => {
    if (!form) return;
    setBackendLimiters(form.watch('backendLimiters') || []);
  }, []);
  useEffect(() => {
    updateLimitersChoices(currentChoices);
  }, [currentChoices]);
  useEffect(() => {
    if (!form) return;
    form.setValue('backendLimiters', currentBackendLimiters);
  }, [currentBackendLimiters]);

  const handleToggleFormula = () => {
    if (!selectedQuestion) return;

    const currentPage = creator?.currentPage;
    const formula: SurveyFormula = form.getValues('formula');
    const updatedFormula: SurveyFormula = JSON.parse(JSON.stringify(formula, null, 2)) as SurveyFormula;
    let correspondingQuestion;
    if (currentPage.isPage) {
      const correspondingPage = updatedFormula?.pages?.find((page) => page.name === currentPage.name);
      correspondingQuestion = correspondingPage?.elements?.find((question) => question.name === selectedQuestion?.name);
    } else {
      correspondingQuestion = updatedFormula?.elements?.find((element) => element.name === selectedQuestion?.name);
    }
    if (correspondingQuestion) {
      if (useBackendLimits) {
        correspondingQuestion.choicesByUrl = null;
        correspondingQuestion.choices = formerChoices || [];
      } else {
        correspondingQuestion.choices = null;
        correspondingQuestion.choicesByUrl = { url: `${SURVEY_RESTFUL_CHOICES}/TEMP/${selectedQuestion.id}` };
      }
    }

    creator.JSON = updatedFormula;

    toggleUseBackendLimits();
  };

  if (!form) return null;
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
          checked={!!useBackendLimits}
          onCheckedChange={handleToggleFormula}
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
