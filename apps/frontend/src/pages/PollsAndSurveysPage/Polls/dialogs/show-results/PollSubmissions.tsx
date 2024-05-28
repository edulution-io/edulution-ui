import React from 'react';
import { Survey } from 'survey-react-ui';
import { Model } from 'survey-core';
import { useTranslation } from 'react-i18next';
import '@/pages/PollsAndSurveysPage/Surveys/components/theme/creator.min.css';
import '@/pages/PollsAndSurveysPage/Surveys/components/theme/default2.min.css';
import { defaultSurveyTheme } from '@/pages/PollsAndSurveysPage/Surveys/components/theme/survey-theme';
import { PollChoices } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';

interface PollSubmissionsProps {
  pollFormula: string;
  choices: PollChoices[];
}

const PollSubmissions = (props: PollSubmissionsProps) => {
  const { pollFormula, choices } = props;

  const { t } = useTranslation();

  if (!pollFormula || !choices) {
    return <div className="bg-gray-600 p-4 text-center">{t('poll.noAnswerWasSubmitted')}</div>;
  }
  const surveyModel = new Model(pollFormula);

  const adjustedChoices = choices.map((choice) => choice.choice).join(', ');
  // console.log('adjustedChoices:', adjustedChoices.toString());

  surveyModel.data = JSON.parse(adjustedChoices);

  surveyModel.mode = 'display';

  surveyModel.applyTheme(defaultSurveyTheme);

  return (
    <div className="max-h-[75vh] overflow-y-scroll rounded bg-gray-600 p-4">
      <Survey model={surveyModel} />
    </div>
  );
};

export default PollSubmissions;
