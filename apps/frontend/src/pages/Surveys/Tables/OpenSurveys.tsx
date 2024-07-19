import React from 'react';
import { useTranslation } from 'react-i18next';
import SurveysPageView from '@libs/survey/types/page-view';
import useSurveysPageHook from '@libs/survey/use-surveys-page-hook';
import SurveysPage from '@/pages/Surveys/Tables/components/SurveyTablePage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
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
      <SurveysPage
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
