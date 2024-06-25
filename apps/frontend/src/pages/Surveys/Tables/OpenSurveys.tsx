import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// import SurveysPageView from '@libs/survey/types/page-view';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import SurveysPage from '@/pages/Surveys/Tables/components/SurveyTablePage';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const OpenSurveys = () => {
  const {
    // selectedPageView,
    // updateSelectedPageView,
    selectedSurvey,
    selectSurvey,
    openSurveys,
    updateOpenSurveys,
    isFetchingOpenSurveys,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  const getOpenSurveys = useCallback(() => {
    if (!isFetchingOpenSurveys) {
      void updateOpenSurveys();
    }
  }, []);

  useEffect((): void => {
    getOpenSurveys();
  }, []);

  if (isFetchingOpenSurveys) {
    return <LoadingIndicator isOpen={isFetchingOpenSurveys} />;
  }

  return (
    <SurveysPage
      title={t('surveys.view.open')}
      selectSurvey={selectSurvey}
      surveys={openSurveys || []}
      selectedSurvey={selectedSurvey}
      canShowResults
      canParticipate
    />
  );
};

export default OpenSurveys;
