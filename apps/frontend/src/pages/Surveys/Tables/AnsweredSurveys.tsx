import React, { useEffect, useCallback } from 'react';
import { useInterval } from 'usehooks-ts';
import { useTranslation } from 'react-i18next';
import SurveysPageView from '@libs/survey/types/page-view';
import FEED_PULL_TIME_INTERVAL from '@libs/dashboard/constants/pull-time-interval';
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

  const getAnsweredSurveys = useCallback(() => {
    if (!answeredSurveys || answeredSurveys.length === 0) {
      if (!isFetchingAnsweredSurveys) {
        void updateAnsweredSurveys();
      }
    }
  }, []);

  useEffect((): void => {
    if (selectedPageView !== SurveysPageView.ANSWERED) {
      selectSurvey(undefined);
      updateSelectedPageView(SurveysPageView.ANSWERED);
    }

    getAnsweredSurveys();
  }, []);

  useInterval(() => {
    void getAnsweredSurveys();
  }, FEED_PULL_TIME_INTERVAL);

  return (
    <>
      {isFetchingAnsweredSurveys ? <LoadingIndicator isOpen={isFetchingAnsweredSurveys} /> : null}
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
    </>
  );
};

export default AnsweredSurveys;
