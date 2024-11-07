import React from 'react';
import mongoose from 'mongoose';
import i18next from 'i18next';
import { Survey } from 'survey-react-ui';
import { Model } from 'survey-core';
import 'survey-core/i18n/english';
import 'survey-core/i18n/german';
import 'survey-core/i18n/french';
import 'survey-core/i18n/spanish';
import 'survey-core/i18n/italian';
import CommitAnswerDto from '@libs/survey/types/api/commit-answer.dto';
import '@/pages/Surveys/theme/default2.min.css';
import '@/pages/Surveys/theme/custom.participation.css';
import surveyTheme from '@/pages/Surveys/theme/theme';

interface ParticipateSurveyProps {
  surveyId: mongoose.Types.ObjectId;
  saveNo: number;
  formula: JSON;
  answer: JSON;
  setAnswer: (answer: JSON) => void;
  pageNo: number;
  setPageNo: (pageNo: number) => void;
  commitAnswer: (answer: CommitAnswerDto) => Promise<boolean>;
  className?: string;
  updateOpenSurveys?: () => void;
  updateAnsweredSurveys?: () => void;
  isPublic?: boolean;
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
    commitAnswer,
    className,
    updateOpenSurveys = () => {},
    updateAnsweredSurveys = () => {},
    isPublic = false,
  } = props;

  const surveyModel = new Model(formula);
  surveyModel.applyTheme(surveyTheme);

  surveyModel.locale = i18next.options.lng || 'en';

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
    _options.showSaveInProgress();
    const success = await commitAnswer({ surveyId, saveNo, answer, surveyEditorCallbackOnSave: _options, isPublic });
    if (!isPublic) {
      updateOpenSurveys();
      updateAnsweredSurveys();
    }
    if (success) {
      _options.showSaveSuccess();
    } else {
      _options.showSaveError();
    }
  });

  return (
    <div className={className}>
      <Survey model={surveyModel} />
    </div>
  );
};
export default ParticipateSurvey;
