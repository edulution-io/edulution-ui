import React from 'react';
import useSurveyStore from '@/pages/Survey/SurveyStore';
import SurveyTable from '@/pages/Survey/Forms/Table/SurveyTable';

const SurveyTableAnsweredSurveys = () => {
  const { answeredSurveys, setSelectedSurvey } = useSurveyStore();
  return (
    <SurveyTable
      surveys={answeredSurveys}
      setSelectedSurvey={setSelectedSurvey}
      showOpenButton
    />
  );
};

export default SurveyTableAnsweredSurveys;
