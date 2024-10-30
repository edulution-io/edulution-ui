import React, { useCallback, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import { useTranslation } from 'react-i18next';
import { FEED_PULL_TIME_INTERVAL_SLOW } from '@libs/dashboard/constants/pull-time-interval';
import SurveyTablePage from '@/pages/Surveys/Tables/SurveyTablePage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const CreatedSurveysPage = () => {
  const { selectedSurvey, selectSurvey, createdSurveys, isFetchingCreatedSurveys, updateCreatedSurveys } =
    useSurveyTablesPageStore();

  const { t } = useTranslation();

  const fetch = useCallback(() => {
    if (!isFetchingCreatedSurveys) {
      void updateCreatedSurveys();
    }
  }, []);

  useEffect(() => {
    selectSurvey(undefined);
    void fetch();
  }, []);

  useInterval(() => {
    void fetch();
  }, FEED_PULL_TIME_INTERVAL_SLOW);

  return (
    <>
      {isFetchingCreatedSurveys ? <LoadingIndicator isOpen={isFetchingCreatedSurveys} /> : null}
      <SurveyTablePage
        title={t('surveys.view.created')}
        selectedSurvey={selectedSurvey}
        surveys={createdSurveys}
        selectSurvey={selectSurvey}
        canDelete
        canEdit
        canShowResults
        canParticipate
        canShowCommitedAnswers
      />
    </>
  );
};

export default CreatedSurveysPage;
