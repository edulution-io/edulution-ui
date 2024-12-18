import React from 'react';
import { useTranslation } from 'react-i18next';
import SurveysPageView from '@libs/survey/types/api/page-view';
import useSurveysPageHook from '@/pages/Surveys/Tables/hooks/use-surveys-page-hook';
import SurveyTablePage from '@/pages/Surveys/Tables/SurveyTablePage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

interface CreatedSurveysProps {
  edit: () => void;
}

const CreatedSurveys = (props: CreatedSurveysProps) => {
  const { edit } = props;
  const {
    selectedPageView,
    updateSelectedPageView,
    selectedSurvey,
    selectSurvey,
    setSelectedRows,
    createdSurveys,
    isFetchingCreatedSurveys,
    updateCreatedSurveys,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  useSurveysPageHook(
    selectedPageView,
    SurveysPageView.CREATED,
    updateSelectedPageView,
    selectSurvey,
    setSelectedRows,
    updateCreatedSurveys,
    isFetchingCreatedSurveys,
    createdSurveys,
  );

  return (
    <>
      {isFetchingCreatedSurveys ? <LoadingIndicator isOpen={isFetchingCreatedSurveys} /> : null}
      <SurveyTablePage
        title={t('surveys.view.created.title')}
        description={t('surveys.view.created.description')}
        selectedSurvey={selectedSurvey}
        surveys={createdSurveys}
        isLoading={isFetchingCreatedSurveys}
        canDelete
        canEdit
        editSurvey={edit}
        canShowResults
        canParticipate
        canShowSubmittedAnswers
      />
    </>
  );
};

export default CreatedSurveys;
