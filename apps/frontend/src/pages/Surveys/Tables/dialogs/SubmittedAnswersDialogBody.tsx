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

import React, { useMemo } from 'react';
import { Survey } from 'survey-react-ui';
import { Model } from 'survey-core';
import { useTranslation } from 'react-i18next';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import surveyTheme from '@/pages/Surveys/theme/surveyTheme';
import TSurveyAnswer from '@libs/survey/types/TSurveyAnswer';

interface SurveySubmissionProps {
  formula: SurveyFormula;
  answer: TSurveyAnswer;
}

const SubmittedAnswersDialogBody = (props: SurveySubmissionProps) => {
  const { formula, answer } = props;

  const { t } = useTranslation();

  const surveyModel = useMemo(() => {
    const model = new Model(formula);
    model.data = answer;
    model.mode = 'display';
    model.applyTheme(surveyTheme);
    return model;
  }, [formula, answer]);

  if (!formula || !answer || !surveyModel) {
    return <div className="bg-accent p-4 text-center">{t('survey.noAnswer')}</div>;
  }

  return (
    <div className="participated-survey max-h-[74vh] overflow-y-auto rounded">
      <Survey model={surveyModel} />
    </div>
  );
};

export default SubmittedAnswersDialogBody;
