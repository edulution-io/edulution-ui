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

import React from 'react';
import { Survey } from 'survey-react-ui';
import { Model } from 'survey-core';
import { FlatDark } from 'survey-core/themes';
import { useTranslation } from 'react-i18next';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/default2.min.css';

interface SurveySubmissionProps {
  formula: SurveyFormula;
  answer: JSON;
}

const SubmittedAnswersDialogBody = (props: SurveySubmissionProps) => {
  const { formula, answer } = props;

  const { t } = useTranslation();

  if (!formula || !answer) {
    return <div className="bg-gray-600 p-4 text-center">{t('survey.noAnswer')}</div>;
  }
  const surveyModel = new Model(formula);

  surveyModel.data = answer;

  surveyModel.mode = 'display';

  surveyModel.applyTheme(FlatDark);

  return (
    <div className="participated-survey max-h-[75vh] overflow-y-scroll rounded bg-gray-600 p-4">
      <Survey model={surveyModel} />
    </div>
  );
};

export default SubmittedAnswersDialogBody;
