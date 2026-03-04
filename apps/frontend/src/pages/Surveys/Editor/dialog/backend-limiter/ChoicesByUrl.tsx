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

import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { cn } from '@edulution-io/ui-kit';
import STANDARD_ACTION_TYPES from '@libs/common/constants/standardActionTypes';
import { TableActionsConfig } from '@libs/common/types/tableActionsConfig';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import useTableActions from '@/hooks/useTableActions';
import APPS from '@libs/appconfig/constants/apps';
import SHOW_OTHER_ITEM from '@libs/survey/constants/show-other-item';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import isQuestionTypeChoiceType from '@libs/survey/utils/isQuestionTypeChoiceType';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import ChoicesWithBackendLimitsShowOtherItem from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesWithBackendLimitsShowOtherItem';
import ChoicesWithBackendLimitTableColumns from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesWithBackendLimitTableColumns';
import Switch from '@/components/ui/Switch';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';

interface ChoicesByUrlProps {
  form: UseFormReturn<SurveyDto>;
}

const ChoicesByUrl = (props: ChoicesByUrlProps) => {
  const { form } = props;

  const { t } = useTranslation();

  const { selectedQuestion } = useQuestionsContextMenuStore();

  const {
    questionType,
    useBackendLimits,
    toggleUseBackendLimits,
    currentChoices,
    addNewChoice,
    setInitialChoices,
    getInitialChoices,
    deleteBackendLimiters,
    uploadBackendLimiter,
  } = useQuestionsContextMenuStore();

  const isPublic = useWatch({ control: form.control, name: 'isPublic' });

  useEffect(() => {
    if (!selectedQuestion) return;
    const questionName = selectedQuestion.name;
    const surveyId = form.getValues('id');
    const limiters = form.getValues('backendLimiters') || {};
    if (useBackendLimits) {
      if (currentChoices.length > 0) {
        setInitialChoices(currentChoices);
      } else if (surveyId) {
        void getInitialChoices(surveyId, questionName);
      } else {
        setInitialChoices(limiters[questionName] || []);
      }
    } else if (limiters[questionName] && limiters[questionName].length > 0) {
      const updatedLimiters = { ...limiters };
      delete updatedLimiters[questionName];
      form.setValue('backendLimiters', updatedLimiters);
      if (surveyId) {
        void deleteBackendLimiters(surveyId, questionName);
      }
    }
  }, [selectedQuestion, useBackendLimits, setInitialChoices, getInitialChoices, deleteBackendLimiters]);

  useEffect(() => {
    if (!selectedQuestion) return;
    const questionName = selectedQuestion.name;

    const limiters = form.getValues('backendLimiters') || {};
    const updatedLimiters = { ...limiters, [questionName]: currentChoices };
    form.setValue('backendLimiters', updatedLimiters);

    const surveyId = form.getValues('id');
    if (surveyId && currentChoices.length > 0) {
      void uploadBackendLimiter(surveyId, questionName, currentChoices);
    }
  }, [currentChoices, selectedQuestion, uploadBackendLimiter]);

  const actionsConfig = useMemo<TableActionsConfig<ChoiceDto>>(
    () => [
      {
        type: STANDARD_ACTION_TYPES.ADD,
        onClick: () => addNewChoice(),
      },
    ],
    [addNewChoice, selectedQuestion],
  );

  const actions = useTableActions(actionsConfig, []);

  if (!form) return null;
  if (!isQuestionTypeChoiceType(questionType)) return null;

  return (
    <>
      <p className="text-m font-bold">{t('survey.editor.questionSettings.backendLimiters')}</p>
      {useBackendLimits ? (
        <p className="b-0 text-sm font-bold text-muted-foreground">{t('survey.editor.questionSettings.nullLimit')}</p>
      ) : (
        <p className="ml-4 text-sm text-muted-foreground">{t('survey.editor.questionSettings.addBackendLimiters')}</p>
      )}
      <div className="ml-2 inline-flex">
        <Switch
          checked={!!useBackendLimits}
          onCheckedChange={() => toggleUseBackendLimits(isPublic || false)}
          className={cn({ 'text-muted-foreground': !useBackendLimits }, { 'text-background': useBackendLimits })}
        />
        <p className="ml-2 text-sm">{t(`common.${useBackendLimits ? 'enabled' : 'disabled'}`)}</p>
      </div>
      {useBackendLimits ? (
        <>
          <div className="ml-4 items-center">
            <ScrollableTable
              columns={ChoicesWithBackendLimitTableColumns}
              data={currentChoices.filter((choice) => choice.name !== SHOW_OTHER_ITEM)}
              filterKey="choice-title"
              filterPlaceHolderText={t('survey.editor.questionSettings.filterPlaceHolderText')}
              applicationName={APPS.SURVEYS}
              actions={actions}
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
