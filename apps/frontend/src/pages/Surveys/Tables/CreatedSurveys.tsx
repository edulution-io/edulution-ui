import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    if (selectedPageView !== SurveysPageView.CREATED_SURVEYS) {
      selectSurvey(undefined);
      updateSelectedPageView(SurveysPageView.CREATED_SURVEYS);
    }

    getCreatedSurveys();
  }, []);

  if (isFetchingCreatedSurveys) {
    return <LoadingIndicator isOpen={isFetchingCreatedSurveys} />;
  }

  return (
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
  );
};

export default CreatedSurveys;
