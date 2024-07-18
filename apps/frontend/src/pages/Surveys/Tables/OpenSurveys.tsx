import React, { useCallback, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import { useTranslation } from 'react-i18next';
import FEED_PULL_TIME_INTERVAL from '@libs/dashboard/constants/pull-time-interval';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import SurveysPage from '@/pages/Surveys/Tables/components/SurveyTablePage';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const OpenSurveys = () => {
  const { selectedSurvey, selectSurvey, openSurveys, updateOpenSurveys, isFetchingOpenSurveys } =
    useSurveyTablesPageStore();

  const { t } = useTranslation();

  const getOpenSurveys = useCallback(() => {
    if (!isFetchingOpenSurveys) {
      void updateOpenSurveys();
    }
  }, []);

  useEffect(() => {
    void getOpenSurveys();
  }, []);

  useInterval(() => {
    void getOpenSurveys();
  }, FEED_PULL_TIME_INTERVAL);

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
