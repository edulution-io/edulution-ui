import React from 'react';
import { useSearchParams } from 'react-router-dom';
import SurveysPageView from '@libs/survey/types/page-view';
import OpenSurveys from '@/pages/Surveys/Tables/OpenSurveys';
import AnsweredSurveys from '@/pages/Surveys/Tables/AnsweredSurveys';
import CreatedSurveys from '@/pages/Surveys/Tables/CreatedSurveys';
import SurveyEditorForm from '@/pages/Surveys/Editor/SurveyEditorForm';

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

  return renderPage();
};

export default SurveysPage;
