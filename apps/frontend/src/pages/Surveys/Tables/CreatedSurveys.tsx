import React from 'react';
import { useTranslation } from 'react-i18next';
import SurveysPageView from '@libs/survey/types/page-view';
import useSurveysPageHook from '@libs/survey/use-surveys-page-hook';
import SurveysPage from '@/pages/Surveys/Tables/components/SurveyTablePage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
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
    updateCreatedSurveys,
    isFetchingCreatedSurveys,
    createdSurveys,
  );

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
