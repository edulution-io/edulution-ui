import React from 'react';
import { useSearchParams } from 'react-router-dom';
import SurveysPageView from '@libs/survey/types/page-view';
import OpenSurveys from '@/pages/Surveys/Tables/OpenSurveys';
import AnsweredSurveys from '@/pages/Surveys/Tables/AnsweredSurveys';
import CreatedSurveys from '@/pages/Surveys/Tables/CreatedSurveys';
import SurveyEditorForm from '@/pages/Surveys/Editor/SurveyEditorForm';
import { TooltipProvider } from '@/components/ui/Tooltip';
import ResultTable from '@/pages/Surveys/Tables/dialogs/ResultTable';
import ResultVisualization from '@/pages/Surveys/Tables/dialogs/ResultVisualization';
import Participate from '@/pages/Surveys/Tables/dialogs/Participate';
import CommitedAnswer from '@/pages/Surveys/Tables/dialogs/CommitedAnswer';

const SurveysPage = () => {
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
        <div className="absolute bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          <ResultTable />
          <ResultVisualization />
          <Participate />
          <CommitedAnswer />
        </div>
      </TooltipProvider>
    </>
  );
};

export default SurveysPage;
