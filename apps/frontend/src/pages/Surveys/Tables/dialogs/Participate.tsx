import React from 'react';
import ParticipateDialog from '@/pages/Surveys/Tables/dialogs/ParticipateDialog';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/ParticipateDialogStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';

const Participate = () => {
  const { selectedSurvey: survey, updateOpenSurveys, updateAnsweredSurveys } = useSurveyTablesPageStore();

  const { isOpenParticipateSurveyDialog, setIsOpenParticipateSurveyDialog, answerSurvey, isLoading } =
    useParticipateDialogStore();

  if (!survey) {
    return null;
  }

  return (
    <ParticipateDialog
      survey={survey}
      isOpenParticipateSurveyDialog={isOpenParticipateSurveyDialog}
      setIsOpenParticipateSurveyDialog={setIsOpenParticipateSurveyDialog}
      commitAnswer={answerSurvey}
      isLoading={isLoading}
      updateOpenSurveys={updateOpenSurveys}
      updateAnsweredSurveys={updateAnsweredSurveys}
    />
  );
};

export default Participate;
