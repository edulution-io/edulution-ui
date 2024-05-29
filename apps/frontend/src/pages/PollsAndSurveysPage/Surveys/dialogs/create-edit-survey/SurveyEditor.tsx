import React from 'react';
import { localization } from 'survey-creator-core';
import { UseFormReturn } from 'react-hook-form';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import 'survey-creator-core/i18n/german';
import '@/pages/PollsAndSurveysPage/Surveys/components/theme/creator.min.css';
import { defaultSurveyTheme } from '@/pages/PollsAndSurveysPage/Surveys/components/theme/survey-theme';

interface EditSurveyProps {
  form: UseFormReturn<any>;
}

const SurveyEditor = (props: EditSurveyProps) => {
  const { form } = props;
  const { survey } = form.getValues();

  const creatorOptions = {
    isAutoSave: true,
    showJSONEditorTab: false,
  };
  const creator = new SurveyCreator(creatorOptions);

  if (!!survey) {
    creator.text = JSON.stringify(survey);
  }

  creator.theme = defaultSurveyTheme;

  creator.saveSurveyFunc = (saveNo: number, callback: (saNo: number, b: boolean) => void) => {
    form.setValue('survey', creator.text);
    form.setValue('saveNo', saveNo);
    callback(saveNo, true);
  };

  localization.currentLocale = 'de';
  return (
    <div className="rounded bg-gray-800 p-4">
      <SurveyCreatorComponent
        creator={creator}
        style={{ height: '70vh' }}
      />
    </div>
  );
};

export default SurveyEditor;
