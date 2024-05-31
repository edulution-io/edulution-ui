import React from 'react';
import { localization } from 'survey-creator-core';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import 'survey-creator-core/i18n/german';
import '@/pages/Surveys/components/theme/creator.min.css';
import { defaultSurveyTheme } from '@/pages/Surveys/components/theme/survey-theme';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';

const EditSurvey = () => {
  const {selectedSurvey, isPosting, /* patchSurvey,resetSurveyAction */ } = useSurveysPageStore();

  if (isPosting) return <div>Loading...</div>;
  if (!selectedSurvey) return <div>No survey selected</div>;

  const creatorOptions = {
    showJSONEditorTab: false,
  };
  const creator = new SurveyCreator(creatorOptions);

  localization.currentLocale = 'de';
  creator.theme = defaultSurveyTheme;
  try {
    if (selectedSurvey?.survey) {
      creator.JSON = selectedSurvey.survey;
    }
  } catch (e) {
    console.warn(e);
  }

  return (
    <SurveyCreatorComponent
      creator={creator}
      style={{
        height: '90vh',
        width: '100%',
      }}
    />
  );
};

export default EditSurvey;
