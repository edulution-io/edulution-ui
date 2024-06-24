import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SurveysPageView from '@libs/survey/types/page-view';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import SurveysPage from '@/pages/Surveys/Tables/components/SurveyTablePage';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

interface SurveysManagementProps {
  edit: () => void;
}

const SurveysManagement = ({ edit }: SurveysManagementProps) => {
  const {
    selectedPageView,
    updateSelectedPageView,
    selectedSurvey,
    selectSurvey,
    allSurveys,
    isFetchingAllSurveys,
    updateAllSurveys,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  const getAllSurveys = useCallback(() => {
    void updateAllSurveys();
  }, []);

  useEffect((): void => {
    if (selectedPageView !== SurveysPageView.MANAGE_SURVEYS) {
      selectSurvey(undefined);
      updateSelectedPageView(SurveysPageView.MANAGE_SURVEYS);
    }

    if (!allSurveys || allSurveys.length === 0) {
      if (!isFetchingAllSurveys) {
        getAllSurveys();
      }
    }
  }, []);

  if (isFetchingAllSurveys) {
    return <LoadingIndicator isOpen={isFetchingAllSurveys} />;
  }

  return (
    <SurveysPage
      title={t('surveys.view.management')}
      selectedSurvey={selectedSurvey}
      surveys={allSurveys}
      selectSurvey={selectSurvey}
      canDelete
      canEdit
      editSurvey={edit}
      canParticipate
      canShowCommitedAnswers
      canShowResults
    />
  );
};

export default SurveysManagement;
