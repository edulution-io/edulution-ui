import React from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import '@/pages/PollsAndSurveysPage/Surveys/components/theme/creator.min.css';
import '@/pages/PollsAndSurveysPage/Surveys/components/theme/default2.min.css';
import { defaultSurveyTheme } from '@/pages/PollsAndSurveysPage/Surveys/components/theme/survey-theme.ts';
import { UseFormReturn } from 'react-hook-form';

interface SurveyParticipationProps {
  surveyName: string;
  surveyFormula: string;
  closeParticipateSurveyDialog: () => void;

  handleFormSubmit: () => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const SurveyParticipation = (props: SurveyParticipationProps) => {
  const { surveyName, surveyFormula, handleFormSubmit, form } = props;

  if (!surveyName || !surveyFormula) {
    return null;
  }
  const surveyModel = new Model(surveyFormula);

  surveyModel.applyTheme(defaultSurveyTheme);

  surveyModel.onComplete.add(async function (sender, options) {
    form.setValue('answer', JSON.stringify(sender.data));
    form.setValue('options', options);
    handleFormSubmit();
  });

  return (
    <div className="max-h-[75vh] overflow-y-scroll rounded bg-gray-600 p-4">
      <Survey model={surveyModel} />
    </div>
  );
};

export default SurveyParticipation;