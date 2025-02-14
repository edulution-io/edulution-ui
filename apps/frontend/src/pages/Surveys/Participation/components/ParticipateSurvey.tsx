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
import 'survey-core/i18n/english';
import 'survey-core/i18n/german';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import useLanguage from '@/hooks/useLanguage';
import surveyTheme from '@/pages/Surveys/theme/theme';
import '@/pages/Surveys/theme/default2.min.css';
import '@/pages/Surveys/theme/custom.participation.css';
import SubmitAnswerDto from '@libs/survey/types/api/submit-answer.dto';

interface ParticipateSurveyProps {
  surveyId: string;
  saveNo: number;
  formula: TSurveyFormula;
  answer: JSON;
  setAnswer: (answer: JSON) => void;
  pageNo: number;
  setPageNo: (pageNo: number) => void;
  submitAnswer: (answerDto: SubmitAnswerDto) => Promise<boolean>;
  updateOpenSurveys?: () => void;
  updateAnsweredSurveys?: () => void;
  isPublic?: boolean;
  className?: string;
}

const ParticipateSurvey = (props: ParticipateSurveyProps) => {
  const {
    surveyId,
    saveNo,
    formula,
    answer,
    setAnswer,
    pageNo,
    setPageNo,
    submitAnswer,
    updateOpenSurveys = () => {},
    updateAnsweredSurveys = () => {},
    isPublic = false,
    className = '',
  } = props;

  const { language } = useLanguage();

  const surveyModel = new Model(formula);
  surveyModel.applyTheme(surveyTheme);

  surveyModel.locale = language;

  if (surveyModel.pages.length > 3) {
    surveyModel.showProgressBar = 'top';
  }

  surveyModel.data = answer;
  surveyModel.currentPageNo = pageNo;

  // TODO: NIEDUUI-211: Add the functionality to stop answering and to continue with that later (persistent store?)
  const saveSurvey = () => {
    setAnswer(surveyModel.data as JSON);
    setPageNo(surveyModel.currentPageNo);
  };
  surveyModel.onValueChanged.add(saveSurvey);
  surveyModel.onDynamicPanelItemValueChanged.add(saveSurvey);
  surveyModel.onMatrixCellValueChanged.add(saveSurvey);
  surveyModel.onCurrentPageChanged.add(saveSurvey);

  surveyModel.onComplete.add(async (_sender, _options) => {
    await submitAnswer({
      surveyId,
      saveNo,
      answer,
      isPublic,
    });
    if (!isPublic) {
      updateOpenSurveys();
      updateAnsweredSurveys();
    }
  });

  return (
    <div className={className}>
      <Survey model={surveyModel} />
    </div>
  );
};
export default ParticipateSurvey;
