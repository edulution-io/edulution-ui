import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import SurveysPage from '@/pages/Surveys/Tables/components/SurveyTablePage';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { PageView } from '@/pages/Surveys/types/page-view';
import ResultTableDialog from '@/pages/Surveys/Tables/dialogs/ResultTableDialog';
import ResultVisualizationDialog from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialog';
import CommitedAnswersDialog from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialog';

const AnsweredSurveys = () => {
  const {
    selectedPageView,
    updateSelectedPageView,

    selectedSurvey,
    selectSurvey,

    answeredSurveys,
    isFetchingAnsweredSurveys,
    updateAnsweredSurveys,

    isOpenCommitedAnswersDialog,
    openCommitedAnswersDialog,
    closeCommitedAnswersDialog,
    getUsersCommitedAnswer,
    // user,
    // selectUser,
    answer,
    isLoadingAnswer,
    errorLoadingAnswer,

    isOpenPublicResultsTableDialog,
    openPublicResultsTableDialog,
    closePublicResultsTableDialog,
    isOpenPublicResultsVisualisationDialog,
    openPublicResultsVisualisationDialog,
    closePublicResultsVisualisationDialog,
    getSurveyResult,
    result,
    isLoadingResult,
    errorLoadingResult,
  } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (!answeredSurveys || answeredSurveys.length === 0) {
      if (!isFetchingAnsweredSurveys) {
        updateAnsweredSurveys();
      }
    }
  }, []);

  useEffect(() => {
    if (selectedPageView !== PageView.ANSWERED_SURVEYS) {
      selectSurvey(undefined);
      updateSelectedPageView(PageView.ANSWERED_SURVEYS);
    }
  }, [selectedPageView]);

  if (isFetchingAnsweredSurveys) {
    return <LoadingIndicator isOpen={isFetchingAnsweredSurveys} />;
  }

  return (
    <>
      <SurveysPage
        title={t('surveys.view.answered')}
        selectedSurvey={selectedSurvey}
        surveys={answeredSurveys}
        selectSurvey={selectSurvey}
        canShowCommitedAnswers
        openCommitedAnswersDialog={openCommitedAnswersDialog}
        canShowResults
        openPublicResultsTableDialog={openPublicResultsTableDialog}
        openPublicResultsVisualisationDialog={openPublicResultsVisualisationDialog}
      />

      <CommitedAnswersDialog
        survey={selectedSurvey!}
        isOpenCommitedAnswersDialog={isOpenCommitedAnswersDialog}
        openCommitedAnswersDialog={openCommitedAnswersDialog}
        closeCommitedAnswersDialog={closeCommitedAnswersDialog}
        getUsersCommitedAnswer={getUsersCommitedAnswer}
        // user={user}
        // selectUser={selectUser}
        answer={answer}
        isLoadingAnswer={isLoadingAnswer}
        errorLoadingAnswer={errorLoadingAnswer}
      />
      <ResultTableDialog
        survey={selectedSurvey!}
        isOpenPublicResultsTableDialog={isOpenPublicResultsTableDialog}
        openPublicResultsTableDialog={openPublicResultsTableDialog}
        closePublicResultsTableDialog={closePublicResultsTableDialog}
        getSurveyResult={getSurveyResult}
        result={result}
        isLoadingResult={isLoadingResult}
        errorLoadingResult={errorLoadingResult}
      />
      <ResultVisualizationDialog
        survey={selectedSurvey!}
        isOpenPublicResultsVisualisationDialog={isOpenPublicResultsVisualisationDialog}
        openPublicResultsVisualisationDialog={openPublicResultsVisualisationDialog}
        closePublicResultsVisualisationDialog={closePublicResultsVisualisationDialog}
        getSurveyResult={getSurveyResult}
        result={result}
        isLoadingResult={isLoadingResult}
        errorLoadingResult={errorLoadingResult}
      />
    </>
  );
};

export default AnsweredSurveys;
