import React from 'react';
import mongoose from 'mongoose';
import { Survey } from 'survey-react-ui';
import { CompleteEvent, Model } from 'survey-core';
import * as SurveyThemes from 'survey-core/themes';
import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/default2.min.css';

interface ParticipateDialogBodyProps {
  surveyId: mongoose.Types.ObjectId;
  saveNo: number;
  formula: JSON;

  answer: JSON;
  setAnswer: (answer: JSON) => void;
  commitAnswer: (
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    options?: CompleteEvent,
  ) => Promise<void>;

  updateOpenSurveys: () => void;
  updateAnsweredSurveys: () => void;

  setIsOpenParticipateSurveyDialog: (state: boolean) => void;
}

const ParticipateDialogBody = (props: ParticipateDialogBodyProps) => {
  const {
    surveyId,
    saveNo,
    formula,
    answer,
    setAnswer,
    commitAnswer,
    updateOpenSurveys,
    updateAnsweredSurveys,
    setIsOpenParticipateSurveyDialog,
  } = props;

  const surveyModel = new Model(formula);
  surveyModel.applyTheme(SurveyThemes.FlatDark);

  // TODO: NIEDUUI-211: Add the functionality to stop answering and to continue with that later (persistent store?)
  surveyModel.data = answer;
  surveyModel.onValueChanging.add(() => setAnswer(surveyModel.data as JSON));
  surveyModel.onValueChanged.add(() => setAnswer(surveyModel.data as JSON));
  surveyModel.onCurrentPageChanged.add(() => setAnswer(surveyModel.data as JSON));

  surveyModel.onComplete.add(async (_sender, options) => {
    await commitAnswer(surveyId, saveNo, answer, options);
    updateOpenSurveys();
    updateAnsweredSurveys();
    setIsOpenParticipateSurveyDialog(false);
  });

  return (
    <div className="max-h-[75vh] overflow-y-scroll rounded bg-gray-600 p-4">
      <Survey model={surveyModel} />
    </div>
  );
};

export default ParticipateDialogBody;
