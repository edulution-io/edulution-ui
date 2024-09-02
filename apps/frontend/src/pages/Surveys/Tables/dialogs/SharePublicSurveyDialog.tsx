import React from 'react';
import { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/api/surveys-endpoint';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import ShareUrlDialog from '@/components/shared/Dialog/ShareUrlDialog';

const SharePublicSurveyDialog = () => {
  const { selectedSurvey } = useSurveyTablesPageStore();

  if (!selectedSurvey || !selectedSurvey.isPublic) return null;

  return (
    <ShareUrlDialog
      url={`${window.location.origin}/${PUBLIC_SURVEYS_ENDPOINT}/?surveyId=${selectedSurvey.id.toString('base64')}`}
    />
  );
};

export default SharePublicSurveyDialog;
