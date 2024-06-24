import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import SurveysPageView from '@libs/survey/types/page-view';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import SurveysPage from '@/pages/Surveys/Tables/components/SurveyTablePage';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const AnsweredSurveys = () => {
  const {
    selectedPageView,
    updateSelectedPageView,
    selectedSurvey,
    selectSurvey,
    answeredSurveys,
    isFetchingAnsweredSurveys,
    updateAnsweredSurveys,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  const getAnsweredSurveys = useCallback( () => {
    if (!answeredSurveys || answeredSurveys.length === 0) {
      if (!isFetchingAnsweredSurveys) {
        void updateAnsweredSurveys();
      }
    }
  }, []);

  useEffect((): void => {
    if (selectedPageView !== SurveysPageView.ANSWERED_SURVEYS) {
      selectSurvey(undefined);
      updateSelectedPageView(SurveysPageView.ANSWERED_SURVEYS);
    }

    getAnsweredSurveys();
  }, []);

  if (isFetchingAnsweredSurveys) {
    return <LoadingIndicator isOpen={isFetchingAnsweredSurveys} />;
  }

  return (
    <SurveysPage
      title={t('surveys.view.answered')}
      selectedSurvey={selectedSurvey}
      surveys={answeredSurveys}
      selectSurvey={selectSurvey}
      canEdit={false}
      canDelete={false}
      canShowResults
      canParticipate
      canShowCommitedAnswers
    />
  );
};

export default AnsweredSurveys;
