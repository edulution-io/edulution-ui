import React from 'react';
import { useLocation } from 'react-router-dom';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
// import 'survey-core/defaultV2.min.css';
// import 'survey-creator-core/survey-creator-core.min.css';
import './default2.min.css';
import './creator.min.css';
import pushAnswer from '@/pages/Survey/Forms/dto/push-answer.dto';
import { surveyTheme } from './survey-theme.ts';

const SurveyParticipation = () => {
  const location = useLocation();

  const surveyname = location?.state?.surveyname;
  if (!surveyname) {
    throw new Error('Survey name is required');
  }

  const survey = location?.state?.survey;
  if (!survey) {
    throw new Error('Survey is required');
  }

  const surveyModel = new Model(survey);

  surveyModel.applyTheme(surveyTheme);

  surveyModel.onComplete.add(function (sender, options) {
    pushAnswer(surveyname, sender.data, options);
  });

  return <Survey model={surveyModel} />;
};

export default SurveyParticipation;
