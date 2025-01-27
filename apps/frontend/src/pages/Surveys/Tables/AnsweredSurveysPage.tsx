import React, { useCallback, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import { useTranslation } from 'react-i18next';
import { FEED_PULL_TIME_INTERVAL_SLOW } from '@libs/dashboard/constants/pull-time-interval';
import SurveyTablePage from '@/pages/Surveys/Tables/SurveyTablePage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const AnsweredSurveysPage = () => {
  const {
    selectSurvey,
    setSelectedRows,
    answeredSurveys,
    isFetchingAnsweredSurveys,
    updateAnsweredSurveys,
    canParticipate,
    hasAnswers,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  const fetch = useCallback(() => {
    if (!isFetchingAnsweredSurveys) {
      void updateAnsweredSurveys();
    }
  }, []);

  useEffect(() => {
    selectSurvey(undefined);
    setSelectedRows({});
    void fetch();
  }, []);

  useInterval(() => {
    void fetch();
  }, FEED_PULL_TIME_INTERVAL_SLOW);

  return (
    <>
      {isFetchingAnsweredSurveys ? <LoadingIndicator isOpen={isFetchingAnsweredSurveys} /> : null}
      <SurveyTablePage
        title={t('surveys.view.answered.title')}
        description={t('surveys.view.answered.description')}
        surveys={answeredSurveys}
        isLoading={isFetchingAnsweredSurveys}
        canShowResults={hasAnswers}
        canParticipate={canParticipate}
        canShowSubmittedAnswers={hasAnswers}
      />
    </>
  );
};

export default AnsweredSurveysPage;
