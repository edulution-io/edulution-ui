import React from 'react';
import { useTranslation } from 'react-i18next';
import SurveysPageView from '@libs/survey/types/page-view';
import useSurveysPageHook from '@libs/survey/use-surveys-page-hook';
import SurveysPage from '@/pages/Surveys/Tables/components/SurveyTablePage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const AnsweredSurveys = () => {
  const {
    selectedPageView,
    updateSelectedPageView,
    selectedSurvey,
    selectSurvey,
    answeredSurveys,
    isFetchingAnsweredSurveys,
    updateAnsweredSurveys,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  useSurveysPageHook(
    selectedPageView,
    SurveysPageView.ANSWERED,
    updateSelectedPageView,
    selectSurvey,
    updateAnsweredSurveys,
    isFetchingAnsweredSurveys,
    answeredSurveys,
  );

  return (
    <>
      {isFetchingAnsweredSurveys ? <LoadingIndicator isOpen={isFetchingAnsweredSurveys} /> : null}
      <SurveysPage
        title={t('surveys.view.answered')}
        selectedSurvey={selectedSurvey}
        surveys={answeredSurveys}
        selectSurvey={selectSurvey}
        canEdit={false}
        canDelete={false}
        canShowResults
        canParticipate
        canShowCommitedAnswers
      />
    </>
  );
};

export default AnsweredSurveys;
