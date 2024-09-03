import React from 'react';
import { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/api/surveys-endpoint';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import ShareUrlDialog from '@/components/shared/Dialog/ShareUrlDialog';

const SharePublicSurveyDialog = () => {
  const { selectedSurvey } = useSurveyTablesPageStore();

  return (
    <ShareUrlDialog
      url={
        selectedSurvey
          ? `${window.location.origin}/${PUBLIC_SURVEYS_ENDPOINT}/?surveyId=${selectedSurvey.id.toString('hex')}`
          : ''
      }
    />
  );
};

export default SharePublicSurveyDialog;
