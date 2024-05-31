import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';
import SurveyTable from '@/pages/Surveys/components/table/SurveyTable';

const SurveyManagement = () => {
  const { setSelectedSurvey, allSurveys, updateAllSurveys, isFetchingAllSurveys } = useSurveysPageStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (!allSurveys || allSurveys.length === 0) {
      updateAllSurveys()
    }
  }, [])

  return (
    <SurveyTable
      title={t('survey.allSurveys')}
      surveys={allSurveys}
      setSelectedSurvey={setSelectedSurvey}
      isLoading={isFetchingAllSurveys}
    />
  );
};

export default SurveyManagement;
