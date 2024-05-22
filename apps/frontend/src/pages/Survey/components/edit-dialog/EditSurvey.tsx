import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import { defaultSurveyTheme } from '@/pages/Survey/components/theme/survey-theme';
import useEditSurveyDialogStore from '@/pages/Survey/components/edit-dialog/EditSurveyDialogStore';
import saveSurveyJson from '@/pages/Survey/components/dto/save-update-survey.dto';
import useSurveyStore from '@/pages/Survey/SurveyStore';

const createSurveyName = () => {
  const currentDate = new Date();
  const id = uuidv4();
  return `${currentDate.getFullYear()}${currentDate.getMonth()}${currentDate.getDay()}${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}${id}`;
};

const EditSurvey = () => {
  const { survey, participants } = useEditSurveyDialogStore();
  const { getCreatedSurveys } = useSurveyStore();
  const surveyname = survey?.surveyname ? survey?.surveyname : createSurveyName();

  const creatorOptions = {
    isAutoSave: true,
    // showLogicTab: true,
    // showThemeTab: true,
  };
  const creator = new SurveyCreator(creatorOptions);

  creator.theme = defaultSurveyTheme;

  creator.text = JSON.stringify(survey?.survey);

  creator.saveSurveyFunc = async (saveNo: number, callback: (saNo: number, b: boolean) => Promise<void>) => {
    await saveSurveyJson(surveyname, creator.JSON, participants, saveNo, callback);
    await getCreatedSurveys();
  };

  creator.getSurveyJSON();

  return (
    <div className="rounded bg-gray-600 p-4">
      <SurveyCreatorComponent
        creator={creator}
        style={{ height: '70vh' }}
      />
    </div>
  );
};

export default EditSurvey;
