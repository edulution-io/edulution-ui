import React from 'react';
import { Survey } from 'survey-react-ui';
import { Model } from 'survey-core';
import { useTranslation } from 'react-i18next';
import '@/pages/Survey/components/theme/creator.min.css';
import '@/pages/Survey/components/theme/default2.min.css';
import { defaultSurveyTheme } from '@/pages/Survey/components/theme/survey-theme';
import useSurveyResultsDialogStore from '@/pages/Survey/components/results-dialog/SurveyResultsDialogStore';

const SurveyResults = () => {
  const { t } = useTranslation();

  const { survey, surveyAnswer } = useSurveyResultsDialogStore();

  if (!survey || !surveyAnswer?.answer) {
    return <div className="bg-gray-600 p-4 text-center">{t('survey.noAnswerWasSubmitted')}</div>;
  }
  const surveyModel = new Model(survey.survey);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  surveyModel.data = JSON.parse(surveyAnswer?.answer);

  surveyModel.mode = 'display';

  surveyModel.applyTheme(defaultSurveyTheme);

  return (
    <div className="max-h-[75vh] overflow-y-scroll rounded bg-gray-600 p-4">
      <Survey model={surveyModel} />
    </div>
  );
};

export default SurveyResults;
