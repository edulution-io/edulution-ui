import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SurveysPageView from '@libs/survey/types/page-view';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import SurveysPage from '@/pages/Surveys/Tables/components/SurveyTablePage';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ParticipateDialog from '@/pages/Surveys/Tables/dialogs/ParticipateDialog';
import ResultTableDialog from '@/pages/Surveys/Tables/dialogs/ResultTableDialog';
import ResultVisualizationDialog from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialog';
import CommitedAnswersDialog from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialog';

interface CreatedSurveysProps {
  edit: () => void;
}

const CreatedSurveys = ({edit}: CreatedSurveysProps) => {
  const {
    selectedPageView,
    updateSelectedPageView,

    createdSurveys,
    isFetchingCreatedSurveys,
    updateCreatedSurveys,

    selectedSurvey,
    selectSurvey,

    deleteSurvey,

    updateOpenSurveys,
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

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  useMemo(async (): Promise<void> => {
    if (!createdSurveys || createdSurveys.length === 0) {
      if (!isFetchingCreatedSurveys) {
        await updateCreatedSurveys();
      }
    }
  }, []);

  useEffect(() => {
    if (selectedPageView !== SurveysPageView.CREATED_SURVEYS) {
      selectSurvey(undefined);
      updateSelectedPageView(SurveysPageView.CREATED_SURVEYS);
    }
  }, [selectedPageView]);

  if (isFetchingCreatedSurveys) {
    return <LoadingIndicator isOpen={isFetchingCreatedSurveys} />;
  }

  return (
    <>
      <SurveysPage
        title={t('surveys.view.created')}
        selectedSurvey={selectedSurvey}
        surveys={createdSurveys}
        selectSurvey={selectSurvey}
        updateOpenSurveys={updateOpenSurveys}
        updateAnsweredSurveys={updateAnsweredSurveys}

        canDelete
        deleteSurvey={() => deleteSurvey}

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
        survey={selectedSurvey}
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

export default CreatedSurveys;
