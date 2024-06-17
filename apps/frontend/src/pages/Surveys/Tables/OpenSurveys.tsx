import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SurveysPageView from '@libs/survey/types/page-view';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import SurveysPage from '@/pages/Surveys/Tables/components/SurveyTablePage';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ParticipateDialog from '@/pages/Surveys/Tables/dialogs/ParticipateDialog';
import ResultTableDialog from '@/pages/Surveys/Tables/dialogs/ResultTableDialog';
import ResultVisualizationDialog from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialog';

const OpenSurveys = () => {
  const {
    selectedPageView,
    updateSelectedPageView,

    selectedSurvey,
    selectSurvey,

    openSurveys,
    isFetchingOpenSurveys,
    updateOpenSurveys,
    updateAnsweredSurveys,

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
  useMemo(async () => {
    if (!openSurveys || openSurveys.length === 0) {
      if (!isFetchingOpenSurveys) {
        await updateOpenSurveys();
      }
    }
  }, []);

  useEffect(() => {
    if (selectedPageView !== SurveysPageView.OPEN_SURVEYS) {
      selectSurvey(undefined);
      updateSelectedPageView(SurveysPageView.OPEN_SURVEYS);
    }
  }, [selectedPageView]);

  if (isFetchingOpenSurveys) {
    return <LoadingIndicator isOpen={isFetchingOpenSurveys} />;
  }

  return (
    <>
      <SurveysPage
        title={t('surveys.view.open')}
        selectSurvey={selectSurvey}
        surveys={openSurveys || []}
        selectedSurvey={selectedSurvey}
        canParticipate
        openParticipateSurveyDialog={openParticipateSurveyDialog}
        canShowResults
        openPublicResultsTableDialog={openPublicResultsTableDialog}
        openPublicResultsVisualisationDialog={openPublicResultsVisualisationDialog}
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

export default OpenSurveys;
