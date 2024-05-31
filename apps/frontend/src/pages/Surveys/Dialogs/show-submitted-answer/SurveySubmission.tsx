import React from 'react';
import { Survey } from 'survey-react-ui';
import { Model } from 'survey-core';
import { useTranslation } from 'react-i18next';
import { defaultSurveyTheme } from '@/pages/Surveys/components/theme/survey-theme';
import '@/pages/Surveys/components/theme/creator.min.css';
import '@/pages/Surveys/components/theme/default2.min.css';

interface SurveySubmissionProps {
  surveyFormula: string;
  answer: string;
}

const SurveySubmission = (props: SurveySubmissionProps) => {
  const { surveyFormula, answer } = props;

  const { t } = useTranslation();

  if (!surveyFormula || !answer) {
    return <div className="bg-gray-600 p-4 text-center">{t('survey.noAnswerWasSubmitted')}</div>;
  }
  const surveyModel = new Model(surveyFormula);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  surveyModel.data = answer;

  surveyModel.mode = 'display';

  surveyModel.applyTheme(defaultSurveyTheme);

  return (
    <div className="max-h-[75vh] overflow-y-scroll rounded bg-gray-600 p-4">
      <Survey model={surveyModel} />
    </div>
  );
};

export default SurveySubmission;
