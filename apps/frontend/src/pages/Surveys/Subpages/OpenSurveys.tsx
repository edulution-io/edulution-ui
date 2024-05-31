import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';
import SurveyTable from '@/pages/Surveys/components/table/SurveyTable';

const OpenSurveysPage = () => {
  const { setSelectedSurvey, openSurveys, updateOpenSurveys, isFetchingOpenSurveys } = useSurveysPageStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (!openSurveys || openSurveys.length === 0) {
      updateOpenSurveys()
    }
  }, [])

  return (
    <SurveyTable
      title={t('survey.openSurveys')}
      surveys={openSurveys}
      setSelectedSurvey={setSelectedSurvey}
      isLoading={isFetchingOpenSurveys}
    />
  );
};

export default OpenSurveysPage;
