/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
import { PUBLIC_SURVEY_CHOICES, SURVEY_CHOICES } from '@libs/survey/constants/surveys-endpoint';
import TSurveyQuestion from '@libs/survey/types/TSurveyQuestion';
import TSurveyElement from '@libs/survey/types/TSurveyElement';
import SHOW_OTHER_ITEM from '@libs/survey/constants/show-other-item';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import isQuestionTypeChoiceType from '@libs/survey/utils/isQuestionTypeChoiceType';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import ChoicesWithBackendLimitsShowOtherItem from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesWithBackendLimitsShowOtherItem';
import ChoicesWithBackendLimitTableColumns from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesWithBackendLimitTableColumns';
import Switch from '@/components/ui/Switch';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import TSurveyPage from '@libs/survey/types/TSurveyPage';

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
    setFormerChoices,
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

  // const getNestedQuestion = (partialFormula: TSurveyElement, questionsNames: string[]): TSurveyElement => {
  //   // eslint-disable-next-line no-console
  //   console.log('getNestedQuestion()', questionsNames, 'partialFormula:', partialFormula);

  //   const currentQuestionName = questionsNames.pop();
  //   if (partialFormula.elements && partialFormula.elements.length > 0) {
  //     const nextQuestionFormula = partialFormula.elements.find((el) => el.name === currentQuestionName);

  //     // eslint-disable-next-line no-console
  //     console.log(questionsNames, 'getNestedQuestion::nextQuestionFormula:', nextQuestionFormula);

  //     return getNestedQuestion(nextQuestionFormula as TSurveyElement, questionsNames);
  //   }
  //   if (partialFormula.templateElements && partialFormula.templateElements.length > 0) {
  //     const nextQuestionFormula = partialFormula.templateElements.find((el) => el.name === currentQuestionName);

  //     // eslint-disable-next-line no-console
  //     console.log(questionsNames, 'getNestedQuestion::nextQuestionFormula:', nextQuestionFormula);

  //     return getNestedQuestion(nextQuestionFormula as TSurveyElement, questionsNames);
  //   }
  //   return partialFormula;
  // };

  // const getNestedQuestionPath = (
  //   formula: SurveyFormula,
  //   currentQuestion: TSurveyQuestion,
  //   formerQuestionsNames: string[],
  // ): TSurveyElement => {
  //   // eslint-disable-next-line no-console
  //   console.log(
  //     'getNestedQuestionPath() formula',
  //     formula,
  //     'currentQuestion:',
  //     currentQuestion,
  //     'Questions Names:',
  //     formerQuestionsNames,
  //   );

  //   if (currentQuestion.hasParent) {
  //     const { parent, parentQuestion } = currentQuestion;

  //     // problem for dynamic panels are both defined
  //     // problem for dynamic panels are both defined
  //     // problem for dynamic panels are both defined

  //     if (parent?.isPanel && !parentQuestion) {
  //       formerQuestionsNames.push(currentQuestion.name);
  //       // eslint-disable-next-line no-console
  //       console.log(formerQuestionsNames, 'getNestedQuestionPath::panelQuestion:', parent as unknown as TSurveyElement);
  //       return getNestedQuestionPath(formula, parent as unknown as TSurveyQuestion, formerQuestionsNames);
  //     }
  //     if (parentQuestion?.isPanel) {
  //       formerQuestionsNames.push(currentQuestion.name);

  //       // eslint-disable-next-line no-console
  //       console.log(formerQuestionsNames, 'getNestedQuestionPath::parentQuestion:', parentQuestion);

  //       return getNestedQuestionPath(formula, parentQuestion as unknown as TSurveyQuestion, formerQuestionsNames);
  //     }
  //     throw new Error('Corresponding parent question was not found');
  //   }
  //   if (currentQuestion?.page?.name) {
  //     formerQuestionsNames.push(currentQuestion.name);
  //     formerQuestionsNames.reverse();
  //     const correspondingPage = formula?.pages?.find((page) => page.name === currentQuestion.page.name);
  //     const nextQuestionFormula = correspondingPage?.elements?.find((el) => el.name === currentQuestion.name);

  //     // eslint-disable-next-line no-console
  //     console.log(formerQuestionsNames, 'getNestedQuestionPath::nextQuestionFormula:', nextQuestionFormula);

  //     if (!nextQuestionFormula) {
  //       throw new Error('Corresponding question element was not found in the page');
  //     }
  //     return getNestedQuestion(nextQuestionFormula, formerQuestionsNames);
  //   }
  //   formerQuestionsNames.push(currentQuestion.name);
  //   formerQuestionsNames.reverse();
  //   const nextQuestionFormula = formula?.elements?.find((el) => el.name === currentQuestion.name);

  //   // eslint-disable-next-line no-console
  //   console.log(formerQuestionsNames, 'getNestedQuestionPath::nextQuestionFormula:', nextQuestionFormula);

  //   if (!nextQuestionFormula) {
  //     throw new Error('Corresponding question element was not found in the formula');
  //   }
  //   return getNestedQuestion(nextQuestionFormula, formerQuestionsNames);
  // };

  // // TODO: SHOULD BE RECURSIVE
  // const processQuestion = (
  //   formula: SurveyFormula,
  //   currentQuestion: TSurveyQuestion,
  // ): { question: TSurveyElement; formula: SurveyFormula } => {
  //   if (!currentQuestion) {
  //     throw new Error('No question selected');
  //   }

  //   // let correspondingQuestion: TSurveyElement | undefined;
  //   //
  //   // if (!currentQuestion.hasParent) {
  //   //   if (selectedQuestion?.page?.name) {
  //   //     const correspondingPage = formula?.pages?.find((page) => page.name === currentQuestion.page.name);
  //   //     correspondingQuestion = correspondingPage?.elements?.find(
  //   //       (question) => question.name === currentQuestion.name,
  //   //     );
  //   //   } else {
  //   //     correspondingQuestion = formula?.elements?.find((element) => element.name === currentQuestion.name);
  //   //   }
  //   //   if (correspondingQuestion) {
  //   //     return { question: correspondingQuestion, formula };
  //   //   }
  //   //   throw new Error('Corresponding Question was not found');
  //   // }
  //   //
  //   // const { parent, parentQuestion } = currentQuestion;
  //   // if (parent?.isPanel || parentQuestion?.isPanel) {
  //   //   const panelQuestion = parentQuestion || parent as unknown as TSurveyQuestion;
  //   //   if (panelQuestion?.page?.name) {
  //   //     const correspondingPage = formula?.pages?.find((page) => page.name === panelQuestion.page.name);
  //   //     const parentPanel = correspondingPage?.elements?.find((question) => question.name === panelQuestion.name);
  //   //     if (parentPanel?.elements) {
  //   //       correspondingQuestion = parentPanel?.elements?.find((question) => question.name === currentQuestion.name);
  //   //     }
  //   //     if (parentPanel?.templateElements) {
  //   //       correspondingQuestion = parentPanel?.templateElements?.find((question) => question.name === currentQuestion.name);
  //   //     }
  //   //   } else {
  //   //     const parentPanel = formula?.elements?.find((element) => element.name === panelQuestion.name);
  //   //     if (parentPanel?.elements) {
  //   //       correspondingQuestion = parentPanel?.elements?.find((question) => question.name === currentQuestion.name);
  //   //     }
  //   //     if (parentPanel?.templateElements) {
  //   //       correspondingQuestion = parentPanel?.templateElements?.find((question) => question.name === currentQuestion.name);
  //   //     }
  //   //   }
  //   //   if (correspondingQuestion) {
  //   //     return { question: correspondingQuestion, formula };
  //   //   }
  //   //   throw new Error('Corresponding Question was not found');
  //   // }
  //   //
  //   // throw new Error('Corresponding Question was not found');

  //   const correspondingQuestion = getNestedQuestionPath(formula, currentQuestion, []);
  //   if (correspondingQuestion) {
  //     return { question: correspondingQuestion, formula };
  //   }

  //   throw new Error('Corresponding Question was not found');
  // };

  const processQuestion = (
    formula: SurveyFormula | TSurveyPage | TSurveyElement,
    currentQuestion: TSurveyQuestion,
  ): TSurveyElement | null => {
    Object.entries(formula).forEach(([key, value]) => {
      if (key === currentQuestion.name) {
        return value as TSurveyElement;
      }
      if (key === 'pages' || key === 'elements' || key === 'templateElements') {
        const items = value as Array<SurveyFormula | TSurveyPage | TSurveyElement>;
        items.forEach((item) => {
          const result = processQuestion(item, currentQuestion);
          if (result) {
            return result;
          }
          return null;
        });
      }
      return null;
    });
    return null;
  };

  const handleToggleFormula = () => {
    if (!selectedQuestion) return;
    if (isUpdatingBackendLimiters) return;

    setIsUpdatingBackendLimiters(true);

    try {
      const isPublic = form.getValues('isPublic') || false;
      const updatedFormula = creator.JSON as SurveyFormula;

      const question = processQuestion(updatedFormula, selectedQuestion as TSurveyQuestion);

      // eslint-disable-next-line no-console
      console.log('Processed formula:', updatedFormula);
      // eslint-disable-next-line no-console
      console.log('Corresponding question:', question);

      if (!question) {
        throw new Error('Corresponding Question was not found');
      }

      if (useBackendLimits) {
        question.choicesByUrl = null;
        question.choices = formerChoices || [];
        question.hideIfChoicesEmpty = false;
      } else {
        setFormerChoices((question.choices as string[]) || []);
        question.choices = null;
        question.choicesByUrl = {
          url: `${EDU_API_URL}/${isPublic ? PUBLIC_SURVEY_CHOICES : SURVEY_CHOICES}/${TEMPORAL_SURVEY_ID_STRING}/${selectedQuestion.name}`,
          valueName: 'title',
          titleName: 'title',
        };
        question.hideIfChoicesEmpty = true;
      }

      // eslint-disable-next-line no-console
      console.log('Updated Question:', question);

      // form.setValue('formula', formula);
      // creator.JSON = formula;

      toggleUseBackendLimits();

      const questions: TSurveyQuestion[] = creator.survey.getAllQuestions(
        undefined,
        undefined,
        true,
      ) as TSurveyQuestion[];
      const updatedQuestion: TSurveyQuestion | undefined = questions.find((q) => q.name === question.name);
      setSelectedQuestion(updatedQuestion);
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
              initialSorting={[{ id: 'choice-title', desc: false }]}
            />
          </div>
          <ChoicesWithBackendLimitsShowOtherItem />
        </>
      ) : null}
    </>
  );
};

export default ChoicesByUrl;
