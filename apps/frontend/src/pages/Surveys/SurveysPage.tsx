import React from 'react';
import { PageView } from '@/pages/Surveys/Subpages/components/types/page-view';
import AnsweredSurveysPage from '@/pages/Surveys/Subpages/AnsweredSurveys';
import CreatedSurveysPage from '@/pages/Surveys/Subpages/CreatedSurveys';
import OpenSurveysPage from '@/pages/Surveys/Subpages/OpenSurveys';
import SurveyManagement from '@/pages/Surveys/Subpages/SurveyManagement';
import SurveyEditor from '@/pages/Surveys/Subpages/Editor/SurveyEditor';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';

const SurveysPage = () => {
  const {
    selectedPageView,
  } = useSurveysPageStore();

  switch (selectedPageView) {
    case PageView.OPEN_SURVEYS:
      return <OpenSurveysPage />;
    case PageView.CREATED_SURVEYS:
      return <CreatedSurveysPage />;
    case PageView.ANSWERED_SURVEYS:
      return <AnsweredSurveysPage />;
    case PageView.SURVEY_CREATOR:
    case PageView.SURVEY_EDITOR:
      return <SurveyEditor />;
    case PageView.MANAGE_SURVEYS:
      return <SurveyManagement />;
    default:
      return <OpenSurveysPage />;
  }
};

export default SurveysPage;
