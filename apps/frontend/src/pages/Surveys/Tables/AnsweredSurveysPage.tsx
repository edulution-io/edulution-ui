import React from 'react';
import { useTranslation } from 'react-i18next';
import SurveysPageView from '@libs/survey/types/api/page-view';
import useSurveysPageHook from '@/pages/Surveys/Tables/hooks/use-surveys-page-hook';
import SurveyTablePage from '@/pages/Surveys/Tables/SurveyTablePage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const AnsweredSurveysPage = () => {
  const {
    selectedPageView,
    updateSelectedPageView,
    selectedSurvey,
    selectSurvey,
    setSelectedRows,
    answeredSurveys,
    isFetchingAnsweredSurveys,
    updateAnsweredSurveys,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  useSurveysPageHook(
    selectedPageView,
    SurveysPageView.ANSWERED,
    updateSelectedPageView,
    selectSurvey,
    setSelectedRows,
    updateAnsweredSurveys,
    isFetchingAnsweredSurveys,
    answeredSurveys,
  );

  return (
    <>
      {isFetchingAnsweredSurveys ? <LoadingIndicator isOpen={isFetchingAnsweredSurveys} /> : null}
      <SurveyTablePage
        title={t('surveys.view.answered.title')}
        description={t('surveys.view.answered.description')}
        selectedSurvey={selectedSurvey}
        surveys={answeredSurveys}
        isLoading={isFetchingAnsweredSurveys}
        canShowResults
        canParticipate
        canShowSubmittedAnswers
      />
    </>
  );
};

export default AnsweredSurveysPage;
