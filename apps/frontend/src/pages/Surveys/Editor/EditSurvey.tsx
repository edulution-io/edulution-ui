import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import SurveyEditorForm from '@/pages/Surveys/Editor/SurveyEditorForm';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const EditSurvey = (): React.ReactNode => {
  const { surveyId } = useParams();

  const { updateSelectedSurvey, isFetching } = useSurveyTablesPageStore();

  useEffect(() => {
    if (surveyId) {
      void updateSelectedSurvey(surveyId);
    }
  }, [surveyId]);

  if (isFetching) {
    return <LoadingIndicator isOpen={isFetching} />;
  }
  return <SurveyEditorForm editMode />;
};

export default EditSurvey;
