import React from 'react';
import { Model } from 'survey-core';
import * as SurveyThemes from 'survey-core/themes';
import { Survey } from 'survey-react-ui';
import { UseFormReturn } from 'react-hook-form';
import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/default2.min.css';

interface ParticipateDialogBodyProps {
  formula: JSON;
  handleFormSubmit: () => Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const ParticipateDialogBody = (props: ParticipateDialogBodyProps) => {
  const { formula, handleFormSubmit, form } = props;

  const surveyModel = new Model(formula);

  surveyModel.applyTheme(SurveyThemes.FlatDark);

  // TODO: NIEDUUI-211: Add the functionality to stop answering and to continue with that later

  surveyModel.onComplete.add(async (sender, options) => {
    form.setValue('answer', sender.data);
    form.setValue('options', options);
    await handleFormSubmit();
  });

  return (
    <div className="max-h-[75vh] overflow-y-scroll rounded bg-gray-600 p-4">
      <Survey model={surveyModel} />
    </div>
  );
};

export default ParticipateDialogBody;