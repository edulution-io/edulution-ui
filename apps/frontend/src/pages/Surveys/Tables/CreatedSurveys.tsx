import React, { useCallback, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import { useTranslation } from 'react-i18next';
import FEED_PULL_TIME_INTERVAL from '@libs/dashboard/constants/pull-time-interval';
import SurveysPageView from '@libs/survey/types/page-view';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import SurveysPage from '@/pages/Surveys/Tables/components/SurveyTablePage';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

interface CreatedSurveysProps {
  edit: () => void;
}

const CreatedSurveys = ({ edit }: CreatedSurveysProps) => {
  const {
    selectedPageView,
    updateSelectedPageView,
    selectedSurvey,
    selectSurvey,
    createdSurveys,
    isFetchingCreatedSurveys,
    updateCreatedSurveys,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  const getCreatedSurveys = useCallback(() => {
    if (!createdSurveys || createdSurveys.length === 0) {
      if (!isFetchingCreatedSurveys) {
        void updateCreatedSurveys();
      }
    }
  }, []);

  useEffect((): void => {
    if (selectedPageView !== SurveysPageView.CREATED) {
      selectSurvey(undefined);
      updateSelectedPageView(SurveysPageView.CREATED);
    }

    getCreatedSurveys();
  }, []);

  useInterval(() => {
    void getCreatedSurveys();
  }, FEED_PULL_TIME_INTERVAL);

  if (isFetchingCreatedSurveys) {
    return <LoadingIndicator isOpen={isFetchingCreatedSurveys} />;
  }

  return (
    <>
      {isFetchingCreatedSurveys ? <LoadingIndicator isOpen={isFetchingCreatedSurveys} /> : null}
      <SurveysPage
        title={t('surveys.view.created')}
        selectedSurvey={selectedSurvey}
        surveys={createdSurveys}
        selectSurvey={selectSurvey}
        canDelete
        canEdit
        editSurvey={edit}
        canShowResults
        canParticipate
        canShowCommitedAnswers
      />
    </>
  );
};

export default CreatedSurveys;
