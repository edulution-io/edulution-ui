import React from 'react';
import useSurveyStore from '@/pages/Survey/SurveyStore';
import SurveyTable from '@/pages/Survey/Forms/Table/SurveyTable';
import CreateSurveyButton from '@/pages/Survey/Forms/Table/components/CreateSurveyButton';

const SurveyTableCreatedSurveys = () => {
  const { createdSurveys, setSelectedSurvey, deleteSurvey } = useSurveyStore();
  return (
    <>
      <SurveyTable
        surveys={createdSurveys}
        setSelectedSurvey={setSelectedSurvey}
        deleteSurvey={deleteSurvey}
        showEditButton
        showDeleteButton
      />
      <CreateSurveyButton />
    </>
  );
};

export default SurveyTableCreatedSurveys;
