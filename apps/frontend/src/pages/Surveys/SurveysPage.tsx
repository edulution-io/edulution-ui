import React from 'react';
import { useMediaQuery } from 'usehooks-ts';
import cn from '@/lib/utils';
import { APPS } from '@/datatypes/types';
import { PageView } from '@/pages/Surveys/Subpages/components/types/page-view';
import AnsweredSurveysPage from '@/pages/Surveys/Subpages/AnsweredSurveys';
import CreatedSurveysPage from '@/pages/Surveys/Subpages/CreatedSurveys';
import OpenSurveysPage from '@/pages/Surveys/Subpages/OpenSurveys';
import SurveyManagement from '@/pages/Surveys/Subpages/SurveyManagement';
import SurveyEditor from '@/pages/Surveys/Subpages/Editor/SurveyEditor';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';
import useFrameStore from '@/routes/IframeStore';

const SurveysPage = () => {
  const {
    selectedPageView,
    selectedSurvey,
    setSelectedSurvey,

    openSurveys,
    updateOpenSurveys,
    isFetchingOpenSurveys,

    answeredSurveys,
    updateAnsweredSurveys,
    isFetchingAnsweredSurveys,

    createdSurveys,
    updateCreatedSurveys,
    isFetchingCreatedSurveys,

    setPageViewSurveyEditor,

    deleteSurvey,
  } = useSurveysPageStore();

  const { activeFrame } = useFrameStore();

  const isMobile = useMediaQuery('(max-width: 768px)');

  const isFrameVisible = () => (activeFrame === APPS.SURVEYS ? 'block' : 'hidden');

  const getSurveyComponent = () => {
    switch (selectedPageView) {
      case PageView.OPEN_SURVEYS:
        return (
          <OpenSurveysPage
            selectedSurvey={selectedSurvey}
            setSelectedSurvey={setSelectedSurvey}
            openSurveys={openSurveys}
            updateOpenSurveys={updateOpenSurveys}
            updateAnsweredSurveys={updateAnsweredSurveys}
            isFetchingOpenSurveys={isFetchingOpenSurveys}
          />
        );
      case PageView.CREATED_SURVEYS:
        return (
          <CreatedSurveysPage
            selectedSurvey={selectedSurvey}
            setSelectedSurvey={setSelectedSurvey}
            createdSurveys={createdSurveys}
            updateCreatedSurveys={updateCreatedSurveys}
            isFetchingCreatedSurveys={isFetchingCreatedSurveys}
            setPageViewSurveyEditor={setPageViewSurveyEditor}
            deleteSurvey={deleteSurvey}
            updateOpenSurveys={updateOpenSurveys}
            updateAnsweredSurveys={updateAnsweredSurveys}
          />
        );
      case PageView.ANSWERED_SURVEYS:
        return (
          <AnsweredSurveysPage
            selectedSurvey={selectedSurvey}
            setSelectedSurvey={setSelectedSurvey}
            answeredSurveys={answeredSurveys}
            updateAnsweredSurveys={updateAnsweredSurveys}
            isFetchingAnsweredSurveys={isFetchingAnsweredSurveys}
          />
        );
      case PageView.SURVEY_CREATOR:
        return (
          <SurveyEditor
            updateCreatedSurveys={updateCreatedSurveys}
            updateOpenSurveys={updateOpenSurveys}
            updateAnsweredSurveys={updateAnsweredSurveys}
          />
        );
      case PageView.SURVEY_EDITOR:
        return (
          <SurveyEditor
            selectedSurvey={selectedSurvey}
            updateCreatedSurveys={updateCreatedSurveys}
            updateOpenSurveys={updateOpenSurveys}
            updateAnsweredSurveys={updateAnsweredSurveys}
          />
        );
      case PageView.MANAGE_SURVEYS:
        return <SurveyManagement />;
      default:
        return (
          <OpenSurveysPage
            selectedSurvey={selectedSurvey}
            setSelectedSurvey={setSelectedSurvey}
            openSurveys={openSurveys}
            updateOpenSurveys={updateOpenSurveys}
            updateAnsweredSurveys={updateAnsweredSurveys}
            isFetchingOpenSurveys={isFetchingOpenSurveys}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        'absolute bottom-[32px] right-[57px] top-0 h-screen',
        isFrameVisible(),
        isMobile ? 'left-4' : 'left-[256px]',
      )}
    >
      {getSurveyComponent()}
    </div>
  );
};

export default SurveysPage;
