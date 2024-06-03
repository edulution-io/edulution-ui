import React from 'react';
import { PageView } from '@/pages/Surveys/Subpages/components/types/page-view';
import AnsweredSurveysPage from '@/pages/Surveys/Subpages/AnsweredSurveys';
import CreatedSurveysPage from '@/pages/Surveys/Subpages/CreatedSurveys';
import OpenSurveysPage from '@/pages/Surveys/Subpages/OpenSurveys';
import SurveyManagement from '@/pages/Surveys/Subpages/SurveyManagement';
import SurveyEditor from '@/pages/Surveys/Subpages/Editor/SurveyEditor';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';
import useFrameStore from '@/routes/IframeStore';
import { APPS } from '@/datatypes/types';
import cn from '@/lib/utils';

const SurveysPage = () => {
  const { selectedPageView } = useSurveysPageStore();
  const { activeFrame } = useFrameStore();

  const getStyle = () => (activeFrame === APPS.SURVEYS ? 'block' : 'hidden');

  const getSurveyComponent = () => {
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

  return (
    <div className={cn('absolute bottom-[32px] left-[256px] right-[57px] top-0 h-screen', getStyle())}>
      {getSurveyComponent()}
    </div>
  );
};

export default SurveysPage;
