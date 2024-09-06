import React from 'react';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import SurveyEditorForm from '@/pages/Surveys/Editor/SurveyEditorForm';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const SurveyEditorWrapper = () => {
  const { isFetching } = useSurveyTablesPageStore();

  if (isFetching) {
    return <LoadingIndicator isOpen={isFetching} />;
  }

  return <SurveyEditorForm editMode />;
};

export default SurveyEditorWrapper;
