import React from 'react';
import { useSearchParams } from 'react-router-dom';
import SurveysPageView from '@libs/survey/types/api/page-view';
import OpenSurveys from '@/pages/Surveys/Tables/OpenSurveys';
import AnsweredSurveys from '@/pages/Surveys/Tables/AnsweredSurveys';
import CreatedSurveys from '@/pages/Surveys/Tables/CreatedSurveys';
import SurveyEditorForm from '@/pages/Surveys/Editor/SurveyEditorForm';
import { TooltipProvider } from '@/components/ui/Tooltip';
import ResultTableDialog from '@/pages/Surveys/Tables/dialogs/ResultTableDialog';
import ResultVisualizationDialog from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialog';
import ParticipateDialog from '@/pages/Surveys/Tables/dialogs/ParticipateDialog';
import SubmittedAnswersDialog from '@/pages/Surveys/Tables/dialogs/SubmittedAnswersDialog';

const SurveysPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page');

  const onClickEdit = () => {
    setSearchParams({ page: SurveysPageView.EDITOR });
  };

  const renderPage = () => {
    switch (page) {
      case SurveysPageView.ANSWERED:
        return <AnsweredSurveys />;
      case SurveysPageView.CREATED:
        return <CreatedSurveys edit={onClickEdit} />;
      case SurveysPageView.CREATOR:
        return <SurveyEditorForm />;
      case SurveysPageView.EDITOR:
        return <SurveyEditorForm editMode />;
      case SurveysPageView.OPEN:
      default:
        return <OpenSurveys />;
    }
  };

  return (
    <>
      {renderPage()}
      <TooltipProvider>
        <div className="absolute bottom-8 flex flex-row items-center space-x-8">
          <ResultTableDialog />
          <ResultVisualizationDialog />
          <ParticipateDialog />
          <SubmittedAnswersDialog />
        </div>
      </TooltipProvider>
    </>
  );
};

export default SurveysPage;
