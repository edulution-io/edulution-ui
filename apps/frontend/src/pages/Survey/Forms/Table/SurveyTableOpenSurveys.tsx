import React from 'react';
import useSurveyStore from '@/pages/Survey/SurveyStore';
import SurveyTable from '@/pages/Survey/Forms/Table/SurveyTable';

const SurveyTableOpenSurveys = () => {
  const { openSurveys, setSelectedSurvey } = useSurveyStore();
  return (
    <SurveyTable
      surveys={openSurveys}
      setSelectedSurvey={setSelectedSurvey}
      showOpenButton
    />
  );
};

export default SurveyTableOpenSurveys;
