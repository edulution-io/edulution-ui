import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SurveysPageView from '@libs/survey/types/api/page-view';
import OpenSurveys from '@/pages/Surveys/Tables/OpenSurveys';
import AnsweredSurveys from '@/pages/Surveys/Tables/AnsweredSurveys';
import CreatedSurveys from '@/pages/Surveys/Tables/CreatedSurveys';
import SurveyEditorForm from '@/pages/Surveys/Editor/SurveyEditorForm';
import SurveyEditorWrapper from '@/pages/Surveys/Editor/SurveyEditorWrapper';
import ResultTableDialog from '@/pages/Surveys/Tables/dialogs/ResultTableDialog';
import ResultVisualizationDialog from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialog';
import CommitedAnswersDialog from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialog';
import Participation from '@/pages/Surveys/Tables/components/Participation';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import { TooltipProvider } from '@/components/ui/Tooltip';

const SurveysPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page');
  const surveyId = searchParams.get('surveyId');

  const { selectedSurvey, updateSelectedPageView, updateSelectedSurvey, isFetching } = useSurveyTablesPageStore();

  if (!page) {
    updateSelectedPageView(SurveysPageView.OPEN);
    setSearchParams({ page: SurveysPageView.OPEN });
  }

  useEffect(() => {
    if (!selectedSurvey && surveyId && !isFetching) {
      void updateSelectedSurvey(surveyId);
    }
  }, [surveyId]);

  const onClickEdit = () => {
    updateSelectedPageView(SurveysPageView.EDITOR);
    setSearchParams({
      page: SurveysPageView.EDITOR,
      surveyId: selectedSurvey ? selectedSurvey.id.toString('hex') : '',
    });
  };
  const onClickParticipate = () => {
    updateSelectedPageView(SurveysPageView.PARTICIPATION);
    setSearchParams({
      page: SurveysPageView.PARTICIPATION,
      surveyId: selectedSurvey ? selectedSurvey.id.toString('hex') : '',
    });
  };

  const renderPage = () => {
    switch (page) {
      case SurveysPageView.ANSWERED:
        return <AnsweredSurveys participate={onClickParticipate} />;
      case SurveysPageView.CREATED:
        return (
          <CreatedSurveys
            edit={onClickEdit}
            participate={onClickParticipate}
          />
        );
      case SurveysPageView.CREATOR:
        return <SurveyEditorForm />;
      case SurveysPageView.EDITOR:
        return <SurveyEditorWrapper />;
      case SurveysPageView.PARTICIPATION:
        return <Participation />;
      case SurveysPageView.OPEN:
      default:
        return <OpenSurveys participate={onClickParticipate} />;
    }
  };

  return (
    <>
      {renderPage()}
      <TooltipProvider>
        <div className="absolute bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          <ResultTableDialog />
          <ResultVisualizationDialog />
          <CommitedAnswersDialog />
        </div>
      </TooltipProvider>
    </>
  );
};

export default SurveysPage;
