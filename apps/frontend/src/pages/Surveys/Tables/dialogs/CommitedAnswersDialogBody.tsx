import React from 'react';
import { Survey } from 'survey-react-ui';
import { Model } from 'survey-core';
import * as SurveyThemes from 'survey-core/themes';
import { useTranslation } from 'react-i18next';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/default2.min.css';

interface SurveySubmissionProps {
  formula: TSurveyFormula;
  answer: JSON;
}

const CommitedAnswersDialogBody = (props: SurveySubmissionProps) => {
  const { formula, answer } = props;

  const { t } = useTranslation();

  if (!formula || !answer) {
    return <div className="bg-gray-600 p-4 text-center">{t('survey.noAnswer')}</div>;
  }
  const surveyModel = new Model(formula as unknown as JSON);

  surveyModel.data = answer;

  surveyModel.mode = 'display';

  surveyModel.applyTheme(SurveyThemes.FlatDark);

  return (
    <div className="max-h-[75vh] overflow-y-scroll rounded bg-gray-600 p-4">
      <Survey model={surveyModel} />
    </div>
  );
};

export default CommitedAnswersDialogBody;
