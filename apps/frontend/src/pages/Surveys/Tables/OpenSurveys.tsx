import React from 'react';
import { useTranslation } from 'react-i18next';
import SurveysPageView from '@libs/survey/types/api/page-view';
import useSurveysPageHook from '@/pages/Surveys/Tables/hooks/use-surveys-page-hook';
import SurveyTablePage from '@/pages/Surveys/Tables/SurveyTablePage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const OpenSurveys = () => {
  const {
    selectedPageView,
    updateSelectedPageView,
    selectedSurvey,
    selectSurvey,
    openSurveys,
    updateOpenSurveys,
    isFetchingOpenSurveys,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  useSurveysPageHook(
    selectedPageView,
    SurveysPageView.OPEN,
    updateSelectedPageView,
    selectSurvey,
    updateOpenSurveys,
    isFetchingOpenSurveys,
    openSurveys,
  );

  return (
    <>
      {isFetchingOpenSurveys ? <LoadingIndicator isOpen={isFetchingOpenSurveys} /> : null}
      <SurveyTablePage
        title={t('surveys.view.open')}
        selectSurvey={selectSurvey}
        surveys={openSurveys || []}
        selectedSurvey={selectedSurvey}
        canShowResults
        canParticipate
      />
    </>
  );
};

export default OpenSurveys;
