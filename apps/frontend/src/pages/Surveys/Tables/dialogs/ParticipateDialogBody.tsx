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
import mongoose from 'mongoose';
import { Survey } from 'survey-react-ui';
import { CompleteEvent, Model } from 'survey-core';
import 'survey-core/i18n/english';
import 'survey-core/i18n/german';
import 'survey-core/i18n/french';
import 'survey-core/i18n/spanish';
import 'survey-core/i18n/italian';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import useLanguage from '@/hooks/useLanguage';
import surveyTheme from '@/pages/Surveys/theme/theme';
import '@/pages/Surveys/theme/default2.min.css';
import '@/pages/Surveys/theme/custom.participation.css';

interface ParticipateDialogBodyProps {
  surveyId: mongoose.Types.ObjectId;
  saveNo: number;
  formula: TSurveyFormula;
  answer: JSON;
  setAnswer: (answer: JSON) => void;
  pageNo: number;
  setPageNo: (pageNo: number) => void;
  submitAnswer: (
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    options?: CompleteEvent,
  ) => Promise<void>;
  updateOpenSurveys: () => void;
  updateAnsweredSurveys: () => void;
  setIsOpenParticipateSurveyDialog: (state: boolean) => void;
  className?: string;
}

const ParticipateDialogBody = (props: ParticipateDialogBodyProps) => {
  const {
    surveyId,
    saveNo,
    formula,
    answer,
    setAnswer,
    pageNo,
    setPageNo,
    submitAnswer,
    updateOpenSurveys,
    updateAnsweredSurveys,
    setIsOpenParticipateSurveyDialog,
    className,
  } = props;

  const { language } = useLanguage();

  const surveyModel = new Model(formula);
  surveyModel.applyTheme(surveyTheme);

  surveyModel.locale = language;

  if (surveyModel.pages.length > 1) {
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
    await submitAnswer(surveyId, saveNo, answer /* , _options */);
    updateOpenSurveys();
    updateAnsweredSurveys();
    setIsOpenParticipateSurveyDialog(false);
  });
  return (
    <div className={className}>
      <Survey model={surveyModel} />
    </div>
  );
};
export default ParticipateDialogBody;
