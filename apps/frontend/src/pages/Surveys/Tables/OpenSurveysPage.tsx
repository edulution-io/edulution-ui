import React, { useCallback, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import { useTranslation } from 'react-i18next';
import { FEED_PULL_TIME_INTERVAL_SLOW } from '@libs/dashboard/constants/pull-time-interval';
import SurveyTablePage from '@/pages/Surveys/Tables/SurveyTablePage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const OpenSurveysPage = () => {
  const { selectedSurvey, selectSurvey, setSelectedRows, openSurveys, updateOpenSurveys, isFetchingOpenSurveys } =
    useSurveyTablesPageStore();

  const { t } = useTranslation();

  const fetch = useCallback(() => {
    if (!isFetchingOpenSurveys) {
      void updateOpenSurveys();
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
      {isFetchingOpenSurveys ? <LoadingIndicator isOpen={isFetchingOpenSurveys} /> : null}
      <SurveyTablePage
        title={t('surveys.view.open.title')}
        description={t('surveys.view.open.description')}
        surveys={openSurveys || []}
        selectedSurvey={selectedSurvey}
        isLoading={isFetchingOpenSurveys}
        canShowResults
        canParticipate
      />
    </>
  );
};

export default OpenSurveysPage;
