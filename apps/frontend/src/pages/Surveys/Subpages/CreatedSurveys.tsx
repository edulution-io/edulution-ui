import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';
import SurveyTable from '@/pages/Surveys/components/table/SurveyTable';

const CreatedSurveysPage = () => {
  const { setSelectedSurvey, createdSurveys, updateCreatedSurveys, isFetchingCreatedSurveys } = useSurveysPageStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (!createdSurveys || createdSurveys.length === 0) {
      updateCreatedSurveys()
    }
  }, [])

  return (
    <SurveyTable
      title={t('survey.createdSurveys')}
      surveys={createdSurveys}
      setSelectedSurvey={setSelectedSurvey}
      isLoading={isFetchingCreatedSurveys}
    />
  );
};

export default CreatedSurveysPage;
