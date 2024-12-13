import React, { useCallback, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import { useTranslation } from 'react-i18next';
import { FEED_PULL_TIME_INTERVAL_SLOW } from '@libs/dashboard/constants/pull-time-interval';
import SurveyTablePage from '@/pages/Surveys/Tables/SurveyTablePage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const CreatedSurveysPage = () => {
  const {
    selectedSurvey,
    selectSurvey,
    setSelectedRows,
    answeredSurveys,
    isFetchingAnsweredSurveys,
    updateAnsweredSurveys,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  const fetch = useCallback(() => {
    if (!isFetchingAnsweredSurveys) {
      void updateAnsweredSurveys();
    }
  }, []);

  useEffect(() => {
    setSelectedRows({});
    selectSurvey(undefined);
    void fetch();
  }, []);

  useInterval(() => {
    void fetch();
  }, FEED_PULL_TIME_INTERVAL_SLOW);

  return (
    <>
      {isFetchingAnsweredSurveys ? <LoadingIndicator isOpen={isFetchingAnsweredSurveys} /> : null}
      <SurveyTablePage
        title={t('surveys.view.created.title')}
        description={t('surveys.view.created.description')}
        selectedSurvey={selectedSurvey}
        surveys={answeredSurveys}
        isLoading={isFetchingAnsweredSurveys}
        canDelete
        canEdit
        canShowResults
        canParticipate
        canShowSubmittedAnswers
      />
    </>
  );
};

export default CreatedSurveysPage;
