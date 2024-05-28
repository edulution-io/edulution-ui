import React from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { UseFormReturn } from 'react-hook-form';
import '@/pages/PollsAndSurveysPage/Surveys/components/theme/creator.min.css';
import '@/pages/PollsAndSurveysPage/Surveys/components/theme/default2.min.css';
import { defaultSurveyTheme } from '@/pages/PollsAndSurveysPage/Surveys/components/theme/survey-theme.ts';

interface PollParticipationProps {
  pollName: string;
  pollString: string;
  closeParticipatePollDialog: () => void;

  handleFormSubmit: () => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

function PollParticipation(props: PollParticipationProps) {
  const { pollName, pollString, handleFormSubmit , form } = props;

  if (!pollName || !pollString) {
    return null;
  }

  const previewOptions = {
    orientation: 'portrait'
  }
  const survey = new Model(pollString, previewOptions);

  survey.applyTheme(defaultSurveyTheme);

  survey.onComplete.add(async function (sender, options) {
    form.setValue('choice', JSON.stringify(sender.data));
    form.setValue('options', options);
    handleFormSubmit();
  });

  return (
    <div className="max-h-[75vh] overflow-y-scroll rounded bg-gray-600 p-4">
      <Survey model={survey}/>
    </div>
  );
}

export default PollParticipation;
