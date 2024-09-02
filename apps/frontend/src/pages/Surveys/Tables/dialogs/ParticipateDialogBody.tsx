import React from 'react';
import mongoose from 'mongoose';
import { Survey } from 'survey-react-ui';
import { CompleteEvent, Model } from 'survey-core';
import * as SurveyThemes from 'survey-core/themes';
import cn from '@/lib/utils';
import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/default2.min.css';

interface ParticipateDialogBodyProps {
  surveyId: mongoose.Types.ObjectId;
  saveNo: number;
  formula: JSON;
  answer: JSON;
  setAnswer: (answer: JSON) => void;
  pageNo: number;
  setPageNo: (pageNo: number) => void;
  inDialog?: boolean;
  // Dialog
  commitAnswer?: (
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    options?: CompleteEvent,
  ) => Promise<void>;
  updateOpenSurveys?: () => void;
  updateAnsweredSurveys?: () => void;
  setIsOpenParticipateSurveyDialog?: (state: boolean) => void;
  // External Page
  openCommitAnswerDialog?: () => void;
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
    commitAnswer,
    updateOpenSurveys,
    updateAnsweredSurveys,
    setIsOpenParticipateSurveyDialog,
    inDialog = true,
    openCommitAnswerDialog,
  } = props;

  const surveyModel = new Model(formula);
  surveyModel.applyTheme(SurveyThemes.FlatDark);

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

  surveyModel.onComplete.add(async (_sender, options) => {
    if (inDialog) {
      if (!commitAnswer || !updateOpenSurveys || !updateAnsweredSurveys || !setIsOpenParticipateSurveyDialog) {
        throw new Error('Missing props in ParticipateDialogBody');
      }
      await commitAnswer(surveyId, saveNo, answer, options);
      updateOpenSurveys();
      updateAnsweredSurveys();
      setIsOpenParticipateSurveyDialog(false);
    } else {
      if (!openCommitAnswerDialog) {
        throw new Error('Missing props in ParticipateDialogBody');
      }
      openCommitAnswerDialog();
    }
  });
  return (
    <div
      className={cn(
        'max-h-[75vh] overflow-y-auto rounded p-4',
        { 'bg-gray-600': inDialog },
        { 'bg-transparent': !inDialog },
      )}
    >
      <Survey model={surveyModel} />
    </div>
  );
};
export default ParticipateDialogBody;
