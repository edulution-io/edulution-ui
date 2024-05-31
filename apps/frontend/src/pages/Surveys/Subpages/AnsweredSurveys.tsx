import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';
import SurveyTable from '@/pages/Surveys/components/table/SurveyTable';

const AnsweredSurveysPage = () => {
  const { setSelectedSurvey, answeredSurveys, updateAnsweredSurveys, isFetchingAnsweredSurveys } = useSurveysPageStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (!answeredSurveys || answeredSurveys.length === 0) {
      updateAnsweredSurveys()
    }
  }, [])

  return (
    <SurveyTable
      title={t('survey.answeredSurveys')}
      surveys={answeredSurveys}
      setSelectedSurvey={setSelectedSurvey}
      isLoading={isFetchingAnsweredSurveys}
    />
  );
};

export default AnsweredSurveysPage;
