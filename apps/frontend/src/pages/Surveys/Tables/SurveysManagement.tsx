import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import SurveysPage from '@/pages/Surveys/Tables/components/SurveyTablePage';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { PageView } from '@/pages/Surveys/types/page-view';
import ParticipateDialog from '@/pages/Surveys/Tables/dialogs/ParticipateDialog';
import ResultTableDialog from '@/pages/Surveys/Tables/dialogs/ResultTableDialog';
import ResultVisualizationDialog from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialog';
import CommitedAnswersDialog from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialog';

interface SurveysManagementProps {
  edit: () => void;
}

const SurveysManagement = ({ edit }: SurveysManagementProps) => {
  const {
    selectedPageView,
    updateSelectedPageView,

    allSurveys,
    isFetchingAllSurveys,
    updateAllSurveys,

    updateOpenSurveys,
    updateAnsweredSurveys,

    selectedSurvey,
    selectSurvey,

    deleteSurvey,

    isOpenCommitedAnswersDialog,
    openCommitedAnswersDialog,
    closeCommitedAnswersDialog,
    getUsersCommitedAnswer,
    // user,
    // selectUser,
    answer,
    isLoadingAnswer,
    errorLoadingAnswer,

    isOpenParticipateSurveyDialog,
    openParticipateSurveyDialog,
    closeParticipateSurveyDialog,
    commitAnswer,
    isCommiting,
    errorCommiting,

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
    if (!allSurveys || allSurveys.length === 0) {
      if (!isFetchingAllSurveys) {
        updateAllSurveys();
      }
    }
  }, []);

  useEffect(() => {
    if (selectedPageView !== PageView.MANAGE_SURVEYS) {
      selectSurvey(undefined);
      updateSelectedPageView(PageView.MANAGE_SURVEYS);
    }
  }, [selectedPageView]);

  if (isFetchingAllSurveys) {
    return <LoadingIndicator isOpen={isFetchingAllSurveys} />;
  }

  return (
    <>
      <SurveysPage
        title={t('surveys.view.management')}
        selectedSurvey={selectedSurvey}
        surveys={allSurveys}
        selectSurvey={selectSurvey}
        canDelete
        deleteSurvey={deleteSurvey}
        canEdit
        editSurvey={edit}
        canParticipate
        openParticipateSurveyDialog={openParticipateSurveyDialog}
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
      <ParticipateDialog
        survey={selectedSurvey!}
        isOpenParticipateSurveyDialog={isOpenParticipateSurveyDialog}
        openParticipateSurveyDialog={openParticipateSurveyDialog}
        closeParticipateSurveyDialog={closeParticipateSurveyDialog}
        commitAnswer={commitAnswer}
        isCommiting={isCommiting}
        errorCommiting={errorCommiting}
        updateOpenSurveys={updateOpenSurveys}
        updateAnsweredSurveys={updateAnsweredSurveys}
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

export default SurveysManagement;
