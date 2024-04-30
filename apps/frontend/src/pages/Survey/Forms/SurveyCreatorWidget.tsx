import * as React from 'react';
import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';
import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';

const creatorOptions = {
  showLogicTab: true,
  isAutoSave: true,
};

const SurveyCreatorWidget = () => {
  const creator = new SurveyCreator(creatorOptions);
  return <SurveyCreatorComponent creator={creator} />;
};

export default SurveyCreatorWidget;
