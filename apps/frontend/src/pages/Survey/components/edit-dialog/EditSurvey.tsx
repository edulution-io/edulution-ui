import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { localization } from 'survey-creator-core';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import { defaultSurveyTheme } from '@/pages/Survey/components/theme/survey-theme';
import useEditSurveyDialogStore from '@/pages/Survey/components/edit-dialog/EditSurveyDialogStore';
import saveSurveyJson from '@/pages/Survey/components/dto/save-update-survey.dto';
import '@/pages/Survey/components/theme/creator.min.css';

const createSurveyName = () => {
  const currentDate = new Date();
  const id = uuidv4();
  return `${currentDate.getFullYear()}${currentDate.getMonth()}${currentDate.getDay()}${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}${id}`;
};

const EditSurvey = () => {
  const { editSurvey, participants } = useEditSurveyDialogStore();

  let surveyName = editSurvey?.surveyname;
  if (!surveyName) {
    surveyName = createSurveyName();
  }

  const creatorOptions = {
    isAutoSave: true,
    // showLogicTab: true,
    // showThemeTab: true,
  };
  const creator = new SurveyCreator(creatorOptions);

  creator.theme = defaultSurveyTheme;

  if (editSurvey?.survey) {
    creator.text = JSON.stringify(editSurvey?.survey);
  }

  creator.saveSurveyFunc = async (saveNo: number, callback: (saNo: number, b: boolean) => Promise<void>) => {
    await saveSurveyJson(surveyName, creator.JSON, participants, saveNo, callback);
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

export default EditSurvey;
