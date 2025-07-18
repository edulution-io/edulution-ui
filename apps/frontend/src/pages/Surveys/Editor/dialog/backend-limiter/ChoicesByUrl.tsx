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

import { toast } from 'sonner';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { SurveyCreatorModel } from 'survey-creator-core';
import { IoAdd } from 'react-icons/io5';
import cn from '@libs/common/utils/className';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import APPS from '@libs/appconfig/constants/apps';
import { SURVEY_CHOICES } from '@libs/survey/constants/surveys-endpoint';
import TSurveyQuestion from '@libs/survey/types/TSurveyQuestion';
import SHOW_OTHER_ITEM from '@libs/survey/constants/show-other-item';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyElement from '@libs/survey/types/TSurveyElement';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import isQuestionTypeChoiceType from '@libs/survey/utils/isQuestionTypeChoiceType';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import ChoicesWithBackendLimitsShowOtherItem from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesWithBackendLimitsShowOtherItem';
import ChoicesWithBackendLimitTableColumns from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesWithBackendLimitTableColumns';
import Switch from '@/components/ui/Switch';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';

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
    isUpdatingBackendLimiters,
    setIsUpdatingBackendLimiters,
    setSelectedQuestion,
    shouldToggleShowOtherItem,
    toggleShowOtherItem,
    setBackendLimiters,
    currentChoices,
    addNewChoice,
    updateLimitersChoices,
    formerChoices,
  } = useQuestionsContextMenuStore();

  useEffect(() => {
    if (!form) return;
    const initialLimiters = form.getValues('backendLimiters');
    if (initialLimiters) {
      setBackendLimiters(initialLimiters);
    }
  }, []);
  useEffect(() => {
    const updatedBackendLimits = updateLimitersChoices(currentChoices);
    if (!form) return;
    form.setValue('backendLimiters', updatedBackendLimits);
  }, [currentChoices]);

  const handleToggleFormula = () => {
    if (!selectedQuestion) return;
    if (isUpdatingBackendLimiters) return;

    setIsUpdatingBackendLimiters(true);

    try {
      let surveyFormula = form.watch('formula');
      if (!surveyFormula) {
        surveyFormula = creator.JSON as SurveyFormula;
      }
      const currentPage = creator?.currentPage;
      const updatedFormula = JSON.parse(JSON.stringify(surveyFormula)) as SurveyFormula;

      let correspondingQuestion: SurveyElement | undefined;
      if (currentPage.isPage) {
        const correspondingPage = updatedFormula?.pages?.find((page) => page.name === currentPage.name);
        correspondingQuestion = correspondingPage?.elements?.find(
          (question) => question.name === selectedQuestion.name,
        );
      } else {
        correspondingQuestion = updatedFormula?.elements?.find((element) => element.name === selectedQuestion.name);
      }

      if (!correspondingQuestion) {
        throw new Error('Corresponding Question was not found');
      }

      if (useBackendLimits) {
        correspondingQuestion.choicesByUrl = null;
        correspondingQuestion.choices = formerChoices || [];
        correspondingQuestion.hideIfChoicesEmpty = false;
      } else {
        correspondingQuestion.choices = null;
        correspondingQuestion.choicesByUrl = {
          url: `${EDU_API_URL}/${SURVEY_CHOICES}/${TEMPORAL_SURVEY_ID_STRING}/${selectedQuestion.name}`,
          valueName: 'title',
          titleName: 'title',
        };
        correspondingQuestion.hideIfChoicesEmpty = true;
      }

      form.setValue('formula', updatedFormula);
      creator.JSON = updatedFormula;
      toggleUseBackendLimits();

      const questions: TSurveyQuestion[] = creator.survey.getAllQuestions() as TSurveyQuestion[];
      const question: TSurveyQuestion | undefined = questions.find((q) => q.name === correspondingQuestion.name);
      setSelectedQuestion(question);
    } catch (error) {
      console.error('Error toggling backend limits:', error);
      toast.error(t('survey.errors.updateOrCreateError'));
    } finally {
      setIsUpdatingBackendLimiters(false);
    }
    if (shouldToggleShowOtherItem) {
      toggleShowOtherItem();
    }
  };

  if (!form) return null;
  if (!isQuestionTypeChoiceType(questionType)) return null;

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
        <p className="ml-2 text-sm">{t(`common.${useBackendLimits ? 'enabled' : 'disabled'}`)}</p>
      </div>
      {useBackendLimits ? (
        <>
          <div className="ml-4 items-center text-foreground">
            <ScrollableTable
              columns={ChoicesWithBackendLimitTableColumns}
              data={currentChoices.filter((choice) => choice.name !== SHOW_OTHER_ITEM)}
              filterKey="choice-title"
              filterPlaceHolderText={t('survey.editor.questionSettings.filterPlaceHolderText')}
              applicationName={APPS.SURVEYS}
              actions={[
                {
                  icon: IoAdd,
                  translationId: 'common.add',
                  onClick: () => addNewChoice(),
                },
              ]}
              showSelectedCount={false}
              isDialog
            />
          </div>
          <ChoicesWithBackendLimitsShowOtherItem />
        </>
      ) : null}
    </>
  );
};

export default ChoicesByUrl;
