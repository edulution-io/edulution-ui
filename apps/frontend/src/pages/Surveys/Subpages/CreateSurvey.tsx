import React from 'react';
import { Serializer } from 'survey-core';
import { localization } from 'survey-creator-core';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import { createSurveyName } from '@/pages/Surveys/components/create-survey-name';
import { Survey } from '@/pages/Surveys/components/types/survey';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import 'survey-creator-core/i18n/german';
import '@/pages/Surveys/components/theme/default2.min.css';
import '@/pages/Surveys/components/theme/creator.min.css';

Serializer.removeProperty("side-bar", "searchInContent");

interface CreateSurveyProps {
  surveyName?: string;
  surveyFormula?: string;
  surveyParticipants?: Attendee[];
  setSelectedSurvey: (survey: Survey) => void;
  isPosting: boolean;
}

const CreateSurvey = (props: CreateSurveyProps) => {
  const {surveyName, surveyFormula, surveyParticipants, setSelectedSurvey, isPosting} = props;



  if (isPosting) return <div>Loading...</div>;

  const creatorOptions = {
    isAutoSave: true,

    showPreviewTab: false,
    showJSONEditorTab: false,
    maxNestedPanels: 0,
  };

  localization.currentLocale = 'de';
  const creator = new SurveyCreator(creatorOptions);

  try {
    if (surveyFormula) {
      creator.JSON = surveyFormula;
    }
  } catch (e) {
    console.warn(e);
  }

  creator.saveSurveyFunc = (saveNo: number, callback: (saveNo: number, isSuccess: boolean) => void) => {
    const newSurvey: Survey = {
      surveyname: surveyName || createSurveyName(),
      survey: creator.JSON,
      participants: surveyParticipants || [],
      saveNo: saveNo,
    };

    setSelectedSurvey(newSurvey);

    // console.log('Survey saved:', newSurvey);

    callback(saveNo, true);
  }

  return (
    <div>
      <SurveyCreatorComponent
        creator={creator}
        style={{
          height: '90vh',
          width: '100%',
        }}
      />
    </div>
  );
}

export default CreateSurvey;
