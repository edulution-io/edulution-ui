import React from 'react';
import { localization } from 'survey-creator-core';
import { UseFormReturn } from 'react-hook-form';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import 'survey-creator-core/i18n/german';
import '@/pages/PollsAndSurveysPage/Surveys/components/theme/creator.min.css';
import { defaultSurveyTheme } from '@/pages/PollsAndSurveysPage/Surveys/components/theme/survey-theme';

interface EditPollProps {
  form: UseFormReturn<any>;
}

const PollEditor = (props: EditPollProps) => {
  const { form } = props;
  const { pollFormula } = form.getValues();

  const creatorOptions = {
    isAutoSave: true,
    showJSONEditorTab: false,
    maxNestedPanels: 0,
    pageEditMode: "single" as "single" | "standard",
    // previewOrientation: "portrait" as "portrait" | "landscape",
    showHeaderInEmptySurvey: true,
  };
  const creator = new SurveyCreator(creatorOptions);

  if (!!pollFormula) {
    creator.text = JSON.stringify(pollFormula);
  }

  creator.theme = defaultSurveyTheme;

  // creator.saveSurveyFunc = async (saveNo: number, callback: (saNo: number, b: boolean) => Promise<void>) => {
  //   await commitSurveyUpdate(surveyName, creator.JSON, participants, saveNo, callback);
  // };

  creator.saveSurveyFunc = (saveNo: number, callback: (saNo: number, b: boolean) => void) => {
    // store changes in local storage and only allow
    // saveSurveyLocally(creator.text, saveNo, callback);
    form.setValue('pollFormula', creator.text);
    form.setValue('saveNo', saveNo);
    callback(saveNo, true);
  }

  localization.currentLocale = "de";
  return (
    <div className="rounded bg-gray-800 p-4">
      <SurveyCreatorComponent
        creator={creator}
        style={{ height: '70vh' }}
      />
    </div>
  );
};

export default PollEditor;
