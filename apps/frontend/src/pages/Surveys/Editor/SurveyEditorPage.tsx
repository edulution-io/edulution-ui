import React from 'react';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import SurveyEditorForm from '@/pages/Surveys/Editor/SurveyEditorForm.tsx';

const SurveyEditorPage = () => {
    const {
    updateOpenSurveys,
    updateAnsweredSurveys,
    updateCreatedSurveys,

    selectedSurvey,
  } = useSurveyTablesPageStore();

  return (
    <SurveyEditorForm
      selectedSurvey={selectedSurvey}
      updateCreatedSurveys={updateCreatedSurveys}
      updateOpenSurveys={updateOpenSurveys}
      updateAnsweredSurveys={updateAnsweredSurveys}
    />
  );
};

export default SurveyEditorPage;
