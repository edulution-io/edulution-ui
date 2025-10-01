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

import React from 'react';
import { Survey } from 'survey-react-ui';
import { Model } from 'survey-core';
import * as SurveyThemes from 'survey-core/themes';
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

  surveyModel.applyTheme(SurveyThemes.FlatDark);

  return (
    <div className="participated-survey max-h-[75vh] overflow-y-scroll rounded bg-gray-600 p-4">
      <Survey model={surveyModel} />
    </div>
  );
};

export default SubmittedAnswersDialogBody;
