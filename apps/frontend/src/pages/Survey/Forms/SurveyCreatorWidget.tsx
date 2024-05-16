import React from 'react';
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';
// import 'survey-core/defaultV2.min.css';
// import 'survey-creator-core/survey-creator-core.min.css';
import saveSurveyJson from './dto/save-update-survey.dto';
// import './default2.min.css';
import './creator.min.css';
import { defaultSurveyTheme /* , surveyTheme */ } from './survey-theme';

const creatorOptions = {
  isAutoSave: true,
  // showLogicTab: true,
  // showThemeTab: true,
};

const SurveyCreatorWidget = () => {
  const creator = new SurveyCreator(creatorOptions);

  const location = useLocation();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let surveyName = location?.state?.surveyname;
  if (!surveyName) {
    const surveyId = uuidv4();
    const dateTime = new Date().toISOString();
    surveyName = `survey-${dateTime}-${surveyId}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const survey = location?.state?.survey;
  if (survey) {
    creator.text = JSON.stringify(survey);
  }

  creator.saveSurveyFunc = (saveNo: number, callback: (saNo: number, b: boolean) => Promise<void>) => {
    saveSurveyJson(surveyName, creator.JSON, saveNo, callback);
  };

  creator.theme = defaultSurveyTheme;

  creator.getSurveyJSON();

  return (
    <SurveyCreatorComponent
      creator={creator}
      style={{
        '--sjs-secondary-backcolor': 'rgba(175, 225, 90, 0.5)',
        '--secondary': 'rgba(175, 225, 90, 0.5)',
        '--sjs-special-green': 'rgba(175, 225, 90, 1)',
      }}
    />
  );
};

export default SurveyCreatorWidget;
